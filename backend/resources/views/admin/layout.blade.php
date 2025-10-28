<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@yield('title','Admin')</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 text-gray-900">
<nav class="bg-white border-b">
  <div class="max-w-6xl mx-auto px-4 py-3 flex gap-4 items-center">
    <a href="{{ route('admin.dashboard') }}" class="font-bold">Pawction Admin</a>
    <a href="{{ route('admin.animals') }}">Animales</a>
    <a href="{{ route('admin.products') }}">Productos</a>
    <a href="{{ route('admin.auctions') }}">Subastas</a>
    <form action="{{ route('admin.logout') }}" method="POST" class="ml-auto">@csrf<button class="underline">Salir</button></form>
  </div>
</nav>
<main class="max-w-6xl mx-auto px-4 py-6">
  @if(session('ok'))<div class="bg-green-100 border border-green-300 p-3 rounded mb-4">{{ session('ok') }}</div>@endif
  @yield('content')
</main>
</body>
</html>
