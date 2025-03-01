# Tefa Todo List

A simple, single-page todo list application built with .NET 8. No authentication required - just add, edit, and manage your tasks.

![Tefa Todo List Screenshot](https://tefa.my.id/Tefa%20Todo%20List.png)

## Features

- ✅ Single-page intuitive interface
- ✅ Add, edit, and delete tasks
- ✅ Mark tasks as completed
- ✅ Filter tasks by status (all, active, completed)
- ✅ MySQL data storage

## Technologies

- ASP.NET Core 8
- Tailwind CSS
- Entity Framework Core with MySQL

## Prerequisites

- .NET 8 SDK
- Visual Studio 2022, Visual Studio Code, or Rider

## Getting Started

### Clone Repository

```bash
git clone https://github.com/leonrxy/tefa-net-leonardusreka.git
cd tefa-net-leonardusreka
cd TefaTodoList
```

Run Migrations

```bash
dotnet ef database update
```

Run Application

```bash
dotnet restore
dotnet build
dotnet run
```
The application will run at http://localhost:5173

## API Documentation
Tefa Todo List API documentation is available at:

- **Swagger UI (Local)**: http://localhost:5173/swagger
- **Postman Documentation (Public)**: https://apidoc.tefa.my.id

The API documentation includes all endpoints, request/response formats, and examples in the Tefa Todo List application.

## Development
Run in development mode with hot reload:
```bash
dotnet watch run
```
## License
This project is licensed under the MIT License.
Developed by Leonardus Reka Jakti.