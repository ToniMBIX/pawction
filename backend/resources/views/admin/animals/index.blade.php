@extends('admin.layout')
@section('title','Animales')
@section('content')
<a class="underline" href="{{ route('admin.animals.create') }}">Nuevo animal</a>
<table class="mt-3 w-full bg-white rounded shadow overflow-hidden">
  <tr class="bg-gray-50"><th class="p-2">ID</th><th>Nombre</th><th>Especie</th><th>Edad</th><th></th></tr>
  @foreach($items as $it)
  <tr class="border-t"><td class="p-2">{{ $it->id }}</td><td>{{ $it->name }}</td><td>{{ $it->species }}</td><td>{{ $it->age }}</td>
    <td class="text-right p-2">
      <a class="underline" href="{{ route('admin.animals.edit',$it) }}">Editar</a>
      <form class="inline" method="POST" action="{{ route('admin.animals.delete',$it) }}">@csrf @method('DELETE') <button class="underline text-red-600">Eliminar</button></form>
    </td>
  </tr>
  @endforeach
</table>
<div class="mt-3">{{ $items->links() }}</div>
@endsection
