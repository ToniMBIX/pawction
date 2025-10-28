@extends('admin.layout')
@section('title','Subasta')
@section('content')
<form method="POST" action="{{ $item->exists ? route('admin.auctions.update',$item) : route('admin.auctions.store') }}">
  @csrf
  <div class="grid md:grid-cols-2 gap-3">
    <input class="border rounded px-3 py-2 md:col-span-2" name="title" placeholder="Título" value="{{ old('title',$item->title) }}">
    <textarea class="border rounded px-3 py-2 md:col-span-2" name="description" placeholder="Descripción">{{ old('description',$item->description) }}</textarea>
    <select class="border rounded px-3 py-2 md:col-span-2" name="product_id">
      @foreach($products as $p)
      <option value="{{ $p->id }}" @selected(old('product_id',$item->product_id)==$p->id)>{{ $p->name }} ({{ $p->animal->name ?? '' }})</option>
      @endforeach
    </select>
    <input class="border rounded px-3 py-2" type="number" step="0.01" name="starting_price" placeholder="Precio inicio" value="{{ old('starting_price',$item->starting_price) }}">
    <input class="border rounded px-3 py-2" type="number" step="0.01" name="current_price" placeholder="Precio actual" value="{{ old('current_price',$item->current_price) }}">
    <input class="border rounded px-3 py-2" type="datetime-local" name="end_at" value="{{ old('end_at', $item->end_at ? \Illuminate\Support\Carbon::parse($item->end_at)->format('Y-m-d\TH:i') : '') }}">
    <select class="border rounded px-3 py-2" name="status">
      @foreach(['active','finished','cancelled'] as $s)
      <option value="{{ $s }}" @selected(old('status',$item->status)==$s)>{{ $s }}</option>
      @endforeach
    </select>
  </div>
  <button class="bg-indigo-600 text-white px-4 py-2 rounded mt-3">Guardar</button>
</form>
@endsection
