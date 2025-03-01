$(document).ready(function () {
  const apiUrl = "/api/TodoItems/";
  let todoIdToDelete = null;

  function setActiveFilter($button) {
    $("#filterAll, #filterActive, #filterCompleted")
      .removeClass("text-blue-600 bg-blue-100")
      .addClass("text-gray-600 bg-gray-100");

    $button
      .removeClass("text-gray-600 bg-gray-100")
      .addClass("text-blue-600 bg-blue-100");
  }

  function getActiveFilter() {
    if ($("#filterActive").hasClass("text-blue-600")) {
      return "active";
    } else if ($("#filterCompleted").hasClass("text-blue-600")) {
      return "completed";
    } else {
      return "all";
    }
  }

  function loadTodos(filter = "all") {
    $("#todoItems").empty();
    $("#loading").show();
    $("#emptyMessage").hide();

    $.getJSON(apiUrl, function (data) {
      $("#loading").hide();
      let filteredData = data;
      if (filter === "active") {
        filteredData = data.filter((todo) => !todo.isComplete);
        console.log(filteredData);
      } else if (filter === "completed") {
        filteredData = data.filter((todo) => todo.isComplete);
      }
      $("#todoCount").text(
        `${filteredData.length} item${filteredData.length !== 1 ? "s" : ""}`
      );
      if (filteredData.length === 0) {
        $("#emptyMessage").show();
      } else {
        filteredData.forEach((todo) => {
          $("#todoItems").append(todoTemplate(todo));
        });
      }
    });
  }

  function todoTemplate(todo) {
    return `
            <li class="flex justify-between items-center p-4 ${
              todo.isComplete ? "bg-green-50" : "bg-white"
            } border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div class="flex-1">
                    <p class="font-medium ${
                      todo.isComplete
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }">${todo.title}</p>
                    ${
                      todo.description
                        ? `<p class="text-sm text-gray-500 mt-1 ${
                            todo.isComplete ? "line-through" : ""
                          }">${todo.description}</p>`
                        : ""
                    }
                </div>
                <div class="flex space-x-2">
                    <button class="editTodo px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors" 
                        data-id="${todo.id}" 
                        data-title="${todo.title}" 
                        data-desc="${todo.description || ""}" 
                        data-complete="${todo.isComplete}">
                        Edit
                    </button>
                    <button class="toggleTodo px-3 py-1 ${
                      todo.isComplete
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white text-sm font-medium rounded-md transition-colors" 
                        data-id="${todo.id}" 
                        data-complete="${!todo.isComplete}">
                        ${todo.isComplete ? "Undo" : "Done"}
                    </button>
                    <button class="deleteTodo px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors" 
                        data-id="${todo.id}">
                        Delete
                    </button>
                </div>
            </li>
        `;
  }

  $("#todoForm").submit(function (e) {
    e.preventDefault();
    const newTodo = {
      title: $("#title").val(),
      description: $("#description").val(),
      isComplete: false,
    };

    $.ajax({
      url: apiUrl,
      type: "POST",
      data: JSON.stringify(newTodo),
      contentType: "application/json",
      success: function () {
        loadTodos();
        $("#title").val("");
        $("#description").val("");
      },
      error: function (xhr, status, error) {
        console.error("Error adding todo:", error);
        alert("Failed to add todo. Please try again.");
      },
    });
  });

  $(document).on("click", ".editTodo", function () {
    $("#editId").val($(this).data("id"));
    $("#editTitle").val($(this).data("title"));
    $("#editDescription").val($(this).data("desc"));
    $("#editIsComplete").prop("checked", $(this).data("complete"));
    $("#editModalTemplate").removeClass("hidden");
  });

  $("#editForm").submit(function (e) {
    e.preventDefault();
    const id = $("#editId").val();
    const updatedTodo = {
      id,
      title: $("#editTitle").val(),
      description: $("#editDescription").val(),
      isComplete: $("#editIsComplete").is(":checked"),
    };

    $.ajax({
      url: apiUrl + id,
      type: "PUT",
      data: JSON.stringify(updatedTodo),
      contentType: "application/json",
      success: function () {
        $("#editModalTemplate").addClass("hidden");
        loadTodos();
      },
      error: function (xhr, status, error) {
        console.error("Error updating todo:", error);
        alert("Failed to update todo. Please try again.");
      },
    });
  });

  $(document).on("click", ".deleteTodo", function () {
    todoIdToDelete = $(this).data("id");
    $("#deleteModalTemplate").removeClass("hidden");
  });

  $("#confirmDelete").click(function () {
    if (todoIdToDelete) {
      $.ajax({
        url: apiUrl + todoIdToDelete,
        type: "DELETE",
        success: function () {
          $("#deleteModalTemplate").addClass("hidden");
          todoIdToDelete = null;
          const activeFilter = getActiveFilter();
          loadTodos(activeFilter);
        },
        error: function (xhr, status, error) {
          console.error("Error deleting todo:", error);
          alert("Failed to delete todo. Please try again.");
          $("#deleteModalTemplate").addClass("hidden");
          todoIdToDelete = null;
        },
      });
    }
  });

  $(".cancelDelete").click(function () {
    $("#deleteModalTemplate").addClass("hidden");
    todoIdToDelete = null;
  });

  $(document).on("click", ".toggleTodo", function () {
    const id = $(this).data("id");
    const isComplete = $(this).data("complete");

    $.getJSON(apiUrl + id, function (todo) {
      todo.isComplete = isComplete;

      $.ajax({
        url: apiUrl + id,
        type: "PUT",
        data: JSON.stringify(todo),
        contentType: "application/json",
        success: function () {
          loadTodos();
        },
        error: function (xhr, status, error) {
          console.error("Error toggling todo:", error);
          alert("Failed to update todo status. Please try again.");
        },
      });
    });
  });

  $(".cancelEdit").click(function () {
    $("#editModalTemplate").addClass("hidden");
  });

  loadTodos();
  $("#filterAll").click(function () {
    setActiveFilter($(this));
    loadTodos("all");
  });

  $("#filterActive").click(function () {
    setActiveFilter($(this));
    loadTodos("active");
  });

  $("#filterCompleted").click(function () {
    setActiveFilter($(this));
    loadTodos("completed");
  });
});
