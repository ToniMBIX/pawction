@extends('admin.layout')
@section('title','Subastas')
@section('content')
<a class="underline" href="{{ route('admin.auctions.create') }}">Nueva subasta</a>
<table class="mt-3 w-full bg-white rounded shadow overflow-hidden">
  <tr class="bg-gray-50"><th class="p-2">ID</th><th>Título</th><th>Producto</th><th>Estado</th><th>Precio</th><th>Termina</th><th></th></tr>
  @foreach($items as $it)
  <tr class="border-t"><td class="p-2">{{ $it->id }}</td><td>{{ $it->title }}</td><td>{{ $it->product->name ?? '' }}</td><td>{{ $it->status }}</td><td>{{ $it->current_price }} €</td><td>{{ $it->end_at }}</td>
    <td class="text-right p-2">
      <a class="underline" href="{{ route('admin.auctions.edit',$it) }}">Editar</a>
      <form class="inline" method="POST" action="{{ route('admin.auctions.delete',$it) }}">@csrf @method('DELETE') <button class="underline text-red-600">Eliminar</button></form>
    </td>
  </tr>
  @endforeach
</table>
<div class="mt-3">{{ $items->links() }}</div>
@endsection
