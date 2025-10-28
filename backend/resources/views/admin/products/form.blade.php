@extends('admin.layout')
@section('title','Producto')
@section('content')
<form method="POST" action="{{ $item->exists ? route('admin.products.update',$item) : route('admin.products.store') }}">
  @csrf
  <div class="grid md:grid-cols-2 gap-3">
    <input class="border rounded px-3 py-2" name="name" placeholder="Nombre" value="{{ old('name',$item->name) }}">
    <select class="border rounded px-3 py-2" name="animal_id">
      @foreach($animals as $a)
      <option value="{{ $a->id }}" @selected(old('animal_id',$item->animal_id)==$a->id)>{{ $a->name }}</option>
      @endforeach
    </select>
    <input class="border rounded px-3 py-2 md:col-span-2" name="image_url" placeholder="Imagen URL" value="{{ old('image_url',$item->image_url) }}">
  </div>
  <button class="bg-indigo-600 text-white px-4 py-2 rounded mt-3">Guardar</button>
</form>
@endsection
