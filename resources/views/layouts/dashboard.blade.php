@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 col-lg-2 px-0">
            <div class="sidebar text-white p-3">
                <div class="text-center mb-4">
                    @if(auth()->user()->avatar)
                        <img src="{{ Storage::url(auth()->user()->avatar) }}" class="rounded-circle mb-2" width="80" height="80">
                    @else
                        <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 80px; height: 80px;">
                            <i class="fas fa-user fa-2x text-muted"></i>
                        </div>
                    @endif
                    <h6 class="mb-0">{{ auth()->user()->name }}</h6>
                    <small class="text-light">
                        @if(auth()->user()->isAdmin())
                            Amministratore
                        @elseif(auth()->user()->isOperator())
                            Operatore
                            @if(auth()->user()->is_online)
                                <span class="online-indicator"></span>Online
                            @endif
                        @else
                            Cliente
                        @endif
                    </small>
                </div>

                <nav class="nav flex-column">
                    @if(auth()->user()->isAdmin())
                        <a class="nav-link text-white {{ request()->routeIs('admin.dashboard') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('admin.dashboard') }}">
                            <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('admin.users') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('admin.users') }}">
                            <i class="fas fa-users me-2"></i> Utenti
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('admin.payouts') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('admin.payouts') }}">
                            <i class="fas fa-money-bill-wave me-2"></i> Pagamenti
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('admin.tickets') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('admin.tickets') }}">
                            <i class="fas fa-ticket-alt me-2"></i> Supporto
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('admin.reviews') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('admin.reviews') }}">
                            <i class="fas fa-star me-2"></i> Recensioni
                        </a>
                    @elseif(auth()->user()->isOperator())
                        <a class="nav-link text-white {{ request()->routeIs('operator.dashboard') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('operator.dashboard') }}">
                            <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('operator.consultations') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('operator.consultations') }}">
                            <i class="fas fa-comments me-2"></i> Consulenze
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('operator.profile') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('operator.profile') }}">
                            <i class="fas fa-user-edit me-2"></i> Profilo
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('operator.availability') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('operator.availability') }}">
                            <i class="fas fa-calendar-alt me-2"></i> Disponibilità
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('operator.payouts') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('operator.payouts') }}">
                            <i class="fas fa-wallet me-2"></i> Guadagni
                        </a>
                    @else
                        <a class="nav-link text-white {{ request()->routeIs('client.dashboard') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('client.dashboard') }}">
                            <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('client.operators') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('client.operators') }}">
                            <i class="fas fa-users me-2"></i> Operatori
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('client.consultations') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('client.consultations') }}">
                            <i class="fas fa-comments me-2"></i> Consulenze
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('client.wallet') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('client.wallet') }}">
                            <i class="fas fa-wallet me-2"></i> Portafoglio
                        </a>
                        <a class="nav-link text-white {{ request()->routeIs('client.support') ? 'active bg-white bg-opacity-25 rounded' : '' }}" href="{{ route('client.support') }}">
                            <i class="fas fa-life-ring me-2"></i> Supporto
                        </a>
                    @endif
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 col-lg-10">
            <div class="p-4">
                @yield('dashboard-content')
            </div>
        </div>
    </div>
</div>
@endsection
