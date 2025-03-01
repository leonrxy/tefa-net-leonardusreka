using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TefaTodoList.Data;
using TefaTodoList.Models;
using System.Text.Json.Serialization;

namespace TefaTodoList.Controllers
{

 public class ApiResponse<T>
    {
        public string Status { get; set; }
        public string Message { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public T Data { get; set; }

        public ApiResponse(string status, string message, T data)
        {
            Status = status;
            Message = message;
            if (status == "success")
            {
                Data = data;
            }
            else
            {
                Data = default; // Akan menjadi null untuk reference types
            }
        }

        public static ApiResponse<T> Success(T data, string message = "")
        {
            return new ApiResponse<T>("success", message, data);
        }

        public static ApiResponse<T> Error(string message)
        {
            return new ApiResponse<T>("error", message, default);
        }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class TodoItemsController : ControllerBase
    {
        private readonly TodoContext _context;

        public TodoItemsController(TodoContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
        {
            var items = await _context.TodoItems
            .OrderBy(t => t.IsComplete)
            .ThenByDescending(t => t.UpdatedAt)
            .ToListAsync();
            return Ok(ApiResponse<IEnumerable<TodoItem>>.Success(items, "Todo items retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound(ApiResponse<TodoItem>.Error("Todo item not found"));
            }

            return Ok(ApiResponse<TodoItem>.Success(todoItem, "Todo item retrieved successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(int id, TodoItemDTO todoItemDTO)
        {
            var existingTodoItem = await _context.TodoItems.FindAsync(id);
            
            if (existingTodoItem == null)
            {
                return NotFound(ApiResponse<object>.Error("Todo item not found"));
            }

            existingTodoItem.Title = todoItemDTO.Title;
            existingTodoItem.Description = todoItemDTO.Description;
            existingTodoItem.IsComplete = todoItemDTO.IsComplete;
            existingTodoItem.UpdatedAt = DateTime.Now;
            try
            {
                await _context.SaveChangesAsync();
                return Ok(ApiResponse<object>.Success(null, "Todo item updated successfully"));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound(ApiResponse<object>.Error("Todo item not found"));
                }
                else
                {
                    return StatusCode(500, ApiResponse<object>.Error("An error occurred while updating the todo item"));
                }
            }
        }

        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItemDTO todoItemDTO)
        {
            var todoItem = new TodoItem
            {
                Title = todoItemDTO.Title,
                Description = todoItemDTO.Description,
                IsComplete = todoItemDTO.IsComplete,
                CreatedAt = DateTime.Now
            };

            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, ApiResponse<TodoItem>.Success(todoItem, "Todo item created successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound(ApiResponse<object>.Error("Todo item not found"));
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Success(null, "Todo item deleted successfully"));
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }

    public class TodoItemDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsComplete { get; set; }
    }
}