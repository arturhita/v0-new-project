@extends('layouts.dashboard')

@section('title', 'Dashboard Admin')

@section('dashboard-content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1 class="h3 mb-0">Dashboard Amministratore</h1>
    <div class="text-muted">
        <i class="fas fa-calendar-alt me-1"></i>
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
                        <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['total_users'] }}</div>
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
                            Operatori Attivi
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['total_operators'] }}</div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-user-tie fa-2x text-gray-300"></i>
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
                            Consulenze Totali
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['total_consultations'] }}</div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-comments fa-2x text-gray-300"></i>
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
                            Ricavi Totali
                        </div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">€{{ number_format($stats['total_revenue'], 2) }}</div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-euro-sign fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Recent Consultations -->
    <div class="col-lg-8 mb-4">
        <div class="card shadow">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 class="m-0 font-weight-bold text-primary">Consulenze Recenti</h6>
                <a href="{{ route('admin.users') }}" class="btn btn-sm btn-primary">Vedi Tutte</a>
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
                                <th>Costo</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($recentConsultations as $consultation)
                                <tr>
                                    <td>{{ $consultation->client->name }}</td>
                                    <td>{{ $consultation->operator->name }}</td>
                                    <td>
                                        <span class="badge bg-info">{{ ucfirst($consultation->type) }}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $consultation->status == 'completed' ? 'success' : ($consultation->status == 'active' ? 'warning' : 'secondary') }}">
                                            {{ ucfirst($consultation->status) }}
                                        </span>
                                    </td>
                                    <td>€{{ number_format($consultation->total_cost, 2) }}</td>
                                    <td>{{ $consultation->created_at->format('d/m/Y H:i') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Pending Operators -->
    <div class="col-lg-4 mb-4">
        <div class="card shadow">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 class="m-0 font-weight-bold text-primary">Operatori in Attesa</h6>
                <span class="badge bg-warning">{{ $stats['pending_operators'] }}</span>
            </div>
            <div class="card-body">
                @foreach($pendingOperators as $operator)
                    <div class="d-flex align-items-center mb-3">
                        @if($operator->avatar)
                            <img src="{{ Storage::url($operator->avatar) }}" class="rounded-circle me-3" width="40" height="40">
                        @else
                            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                        @endif
                        <div class="flex-grow-1">
                            <h6 class="mb-0">{{ $operator->name }}</h6>
                            <small class="text-muted">{{ $operator->email }}</small>
                        </div>
                        <form method="POST" action="{{ route('admin.users.approve', $operator) }}" class="d-inline">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="btn btn-sm btn-success">
                                <i class="fas fa-check"></i>
                            </button>
                        </form>
                    </div>
                @endforeach
                
                @if($pendingOperators->isEmpty())
                    <p class="text-muted text-center">Nessun operatore in attesa</p>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="row">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">Azioni Rapide</h6>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <div class="d-flex align-items-center p-3 bg-light rounded">
                            <i class="fas fa-ticket-alt fa-2x text-danger me-3"></i>
                            <div>
                                <h6 class="mb-0">{{ $stats['open_tickets'] }}</h6>
                                <small class="text-muted">Ticket Aperti</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="d-flex align-items-center p-3 bg-light rounded">
                            <i class="fas fa-money-bill-wave fa-2x text-success me-3"></i>
                            <div>
                                <h6 class="mb-0">€{{ number_format($stats['pending_payouts'], 2) }}</h6>
                                <small class="text-muted">Pagamenti in Attesa</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="d-flex align-items-center p-3 bg-light rounded">
                            <i class="fas fa-comments fa-2x text-info me-3"></i>
                            <div>
                                <h6 class="mb-0">{{ $stats['active_consultations'] }}</h6>
                                <small class="text-muted">Consulenze Attive</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="d-flex align-items-center p-3 bg-light rounded">
                            <i class="fas fa-user-clock fa-2x text-warning me-3"></i>
                            <div>
                                <h6 class="mb-0">{{ $stats['pending_operators'] }}</h6>
                                <small class="text-muted">Operatori da Approvare</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
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
@endpush
