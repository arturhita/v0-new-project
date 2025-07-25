@extends('layouts.app')

@section('title', 'Dashboard Admin - Piattaforma Consulenza')

@section('content')
<div class="container-fluid py-4">
    <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 col-lg-2">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0"><i class="fas fa-tachometer-alt me-2"></i>Admin Panel</h6>
                </div>
                <div class="list-group list-group-flush">
                    <a href="{{ route('admin.dashboard') }}" class="list-group-item list-group-item-action active">
                        <i class="fas fa-home me-2"></i>Dashboard
                    </a>
                    <a href="{{ route('admin.users') }}" class="list-group-item list-group-item-action">
                        <i class="fas fa-users me-2"></i>Utenti
                        @if($stats['pending_operators'] > 0)
                            <span class="badge bg-warning ms-auto">{{ $stats['pending_operators'] }}</span>
                        @endif
                    </a>
                    <a href="{{ route('admin.payouts') }}" class="list-group-item list-group-item-action">
                        <i class="fas fa-money-bill-wave me-2"></i>Pagamenti
                        @if($stats['pending_payouts'] > 0)
                            <span class="badge bg-warning ms-auto">{{ $stats['pending_payouts'] }}</span>
                        @endif
                    </a>
                    <a href="{{ route('admin.tickets') }}" class="list-group-item list-group-item-action">
                        <i class="fas fa-ticket-alt me-2"></i>Supporto
                        @if($stats['open_tickets'] > 0)
                            <span class="badge bg-danger ms-auto">{{ $stats['open_tickets'] }}</span>
                        @endif
                    </a>
                    <a href="{{ route('admin.reviews') }}" class="list-group-item list-group-item-action">
                        <i class="fas fa-star me-2"></i>Recensioni
                        @if($stats['pending_reviews'] > 0)
                            <span class="badge bg-info ms-auto">{{ $stats['pending_reviews'] }}</span>
                        @endif
                    </a>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 col-lg-10">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 text-white">Dashboard Amministratore</h1>
                <div class="text-white-50">
                    <i class="fas fa-calendar me-1"></i>
                    {{ now()->format('d/m/Y H:i') }}
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-primary shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Utenti Totali
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        {{ number_format($stats['total_users']) }}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-success shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Consulenze Completate
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        {{ number_format($stats['completed_consultations']) }}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-comments fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-info shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Ricavi Totali
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        €{{ number_format($stats['total_revenue'], 2) }}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-euro-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-left-warning shadow h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Operatori in Attesa
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                                        {{ $stats['pending_operators'] }}
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-clock fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="row">
                <div class="col-lg-8 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">Consulenze Recenti</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Operatore</th>
                                            <th>Tipo</th>
                                            <th>Stato</th>
                                            <th>Data</th>
                                            <th>Importo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($recentConsultations as $consultation)
                                            <tr>
                                                <td>{{ $consultation->client->name }}</td>
                                                <td>{{ $consultation->operator->name }}</td>
                                                <td>
                                                    <span class="badge bg-info">
                                                        {{ ucfirst($consultation->type) }}
                                                    </span>
                                                </td>
                                                <td>
                                                    @switch($consultation->status)
                                                        @case('pending')
                                                            <span class="badge bg-warning">In Attesa</span>
                                                            @break
                                                        @case('active')
                                                            <span class="badge bg-success">Attiva</span>
                                                            @break
                                                        @case('completed')
                                                            <span class="badge bg-primary">Completata</span>
                                                            @break
                                                        @case('cancelled')
                                                            <span class="badge bg-danger">Annullata</span>
                                                            @break
                                                    @endswitch
                                                </td>
                                                <td>{{ $consultation->created_at->format('d/m/Y H:i') }}</td>
                                                <td>€{{ number_format($consultation->total_cost, 2) }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">Nuovi Utenti</h6>
                        </div>
                        <div class="card-body">
                            @foreach($recentUsers as $user)
                                <div class="d-flex align-items-center mb-3">
                                    <div class="me-3">
                                        @if($user->avatar)
                                            <img src="{{ Storage::url($user->avatar) }}" 
                                                 class="rounded-circle" 
                                                 width="40" height="40" 
                                                 style="object-fit: cover;">
                                        @else
                                            <div class="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center" 
                                                 style="width: 40px; height: 40px;">
                                                <i class="fas fa-user text-white"></i>
                                            </div>
                                        @endif
                                    </div>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0">{{ $user->name }}</h6>
                                        <small class="text-muted">
                                            {{ ucfirst($user->role) }} - 
                                            {{ $user->created_at->diffForHumans() }}
                                        </small>
                                    </div>
                                    @if($user->role === 'operator' && $user->status === 'pending')
                                        <span class="badge bg-warning">In Attesa</span>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.border-left-primary {
    border-left: 0.25rem solid #4e73df !important;
}
.border-left-success {
    border-left: 0.25rem solid #1cc88a !important;
}
.border-left-info {
    border-left: 0.25rem solid #36b9cc !important;
}
.border-left-warning {
    border-left: 0.25rem solid #f6c23e !important;
}
</style>
@endsection
