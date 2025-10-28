<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Login Admin</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
<div class="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
  <h1 class="text-xl font-bold mb-4">Panel de administración</h1>
  @if ($errors->any())<div class="bg-red-100 border border-red-300 p-2 mb-3 rounded">{{ $errors->first() }}</div>@endif
  <form method="POST" action="{{ route('admin.login.post') }}">@csrf
    <input class="border rounded px-3 py-2 w-full mb-2" type="email" name="email" placeholder="Email" required>
    <input class="border rounded px-3 py-2 w-full mb-4" type="password" name="password" placeholder="Contraseña" required>
    <button class="bg-indigo-600 text-white px-4 py-2 rounded w-full">Entrar</button>
  </form>
</div>
</body>
</html>
