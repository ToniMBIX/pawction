@extends('admin.layout')
@section('title','Dashboard')
@section('content')
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="bg-white p-4 rounded shadow">Subastas: <b>{{ $stats['auctions'] }}</b></div>
  <div class="bg-white p-4 rounded shadow">Activas: <b>{{ $stats['active'] }}</b></div>
  <div class="bg-white p-4 rounded shadow">Finalizadas: <b>{{ $stats['finished'] }}</b></div>
  <div class="bg-white p-4 rounded shadow">Animales: <b>{{ $stats['animals'] }}</b></div>
</div>
@endsection
