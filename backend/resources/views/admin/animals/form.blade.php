@extends('admin.layout')
@section('title','Animal')
@section('content')
<form method="POST" action="{{ $item->exists ? route('admin.animals.update',$item) : route('admin.animals.store') }}">
  @csrf
  <div class="grid md:grid-cols-2 gap-3">
    <input class="border rounded px-3 py-2" name="name" placeholder="Nombre" value="{{ old('name',$item->name) }}">
    <input class="border rounded px-3 py-2" name="species" placeholder="Especie" value="{{ old('species',$item->species) }}">
    <input class="border rounded px-3 py-2" name="age" type="number" placeholder="Edad" value="{{ old('age',$item->age) }}">
    <input class="border rounded px-3 py-2" name="photo_url" placeholder="Foto URL" value="{{ old('photo_url',$item->photo_url) }}">
    <input class="border rounded px-3 py-2" name="info_url" placeholder="Info URL" value="{{ old('info_url',$item->info_url) }}">
    <textarea class="border rounded px-3 py-2 md:col-span-2" name="description" placeholder="Descripción">{{ old('description',$item->description) }}</textarea>
  </div>
  <button class="bg-indigo-600 text-white px-4 py-2 rounded mt-3">Guardar</button>
</form>
@endsection
