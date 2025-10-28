@extends('admin.layout')
@section('title','Productos')
@section('content')
<a class="underline" href="{{ route('admin.products.create') }}">Nuevo producto</a>
<table class="mt-3 w-full bg-white rounded shadow overflow-hidden">
  <tr class="bg-gray-50"><th class="p-2">ID</th><th>Nombre</th><th>Animal</th><th></th></tr>
  @foreach($items as $it)
  <tr class="border-t"><td class="p-2">{{ $it->id }}</td><td>{{ $it->name }}</td><td>{{ $it->animal->name ?? '' }}</td>
    <td class="text-right p-2">
      <a class="underline" href="{{ route('admin.products.edit',$it) }}">Editar</a>
      <form class="inline" method="POST" action="{{ route('admin.products.delete',$it) }}">@csrf @method('DELETE') <button class="underline text-red-600">Eliminar</button></form>
    </td>
  </tr>
  @endforeach
</table>
<div class="mt-3">{{ $items->links() }}</div>
@endsection
