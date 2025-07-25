@extends('layouts.app')

@section('title', 'Consulenza Online - La tua guida spirituale')

@section('content')
<!-- Hero Section -->
<section class="bg-primary text-white py-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold mb-4">Trova la tua guida spirituale</h1>
                <p class="lead mb-4">Connettiti con esperti qualificati per consulenze di amore, lavoro, famiglia e spiritualità. Ricevi risposte immediate attraverso chat, chiamate o videochiamate.</p>
                <div class="d-flex gap-3">
                    <a href="{{ route('register') }}" class="btn btn-light btn-lg">
                        <i class="fas fa-user-plus me-2"></i>Inizia Ora
                    </a>
                    @guest
                        <a href="{{ route('login') }}" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-sign-in-alt me-2"></i>Accedi
                        </a>
                    @endguest
                </div>
            </div>
            <div class="col-lg-6 text-center">
                <i class="fas fa-crystal-ball fa-10x opacity-75"></i>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="py-5 bg-light">
    <div class="container">
        <div class="row text-center">
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-users fa-3x text-primary mb-3"></i>
                        <h3 class="fw-bold">{{ $stats['total_operators'] }}</h3>
                        <p class="text-muted">Operatori Qualificati</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-comments fa-3x text-success mb-3"></i>
                        <h3 class="fw-bold">{{ $stats['total_consultations'] }}</h3>
                        <p class="text-muted">Consulenze Completate</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-clock fa-3x text-warning mb-3"></i>
                        <h3 class="fw-bold">{{ $stats['online_operators'] }}</h3>
                        <p class="text-muted">Operatori Online</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Featured Operators -->
<section class="py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="fw-bold">I Nostri Migliori Operatori</h2>
            <p class="text-muted">Esperti qualificati pronti ad aiutarti</p>
        </div>
        
        <div class="row">
            @foreach($operators as $operator)
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center">
                            @if($operator->avatar)
                                <img src="{{ Storage::url($operator->avatar) }}" class="rounded-circle mb-3" width="80" height="80">
                            @else
                                <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                                    <i class="fas fa-user fa-2x text-muted"></i>
                                </div>
                            @endif
                            
                            <h5 class="card-title">{{ $operator->name }}</h5>
                            
                            @if($operator->is_online)
                                <span class="badge bg-success mb-2">
                                    <span class="online-indicator"></span>Online
                                </span>
                            @endif
                            
                            <div class="rating mb-2">
                                @for($i = 1; $i <= 5; $i++)
                                    <i class="fas fa-star {{ $i <= $operator->rating ? 'text-warning' : 'text-muted' }}"></i>
                                @endfor
                                <small class="text-muted">({{ $operator->reviews_count }})</small>
                            </div>
                            
                            @if($operator->specialties)
                                <div class="mb-3">
                                    @foreach(array_slice($operator->specialties, 0, 2) as $specialty)
                                        <span class="badge bg-light text-dark me-1">{{ $specialty }}</span>
                                    @endforeach
                                </div>
                            @endif
                            
                            <p class="text-muted small">€{{ number_format($operator->hourly_rate, 2) }}/ora</p>
                            
                            @auth
                                @if(auth()->user()->isClient())
                                    <a href="{{ route('client.operator.show', $operator) }}" class="btn btn-primary btn-sm">
                                        Consulta Ora
                                    </a>
                                @endif
                            @else
                                <a href="{{ route('register') }}" class="btn btn-primary btn-sm">
                                    Registrati per Consultare
                                </a>
                            @endauth
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
        
        <div class="text-center mt-4">
            @auth
                @if(auth()->user()->isClient())
                    <a href="{{ route('client.operators') }}" class="btn btn-outline-primary">
                        Vedi Tutti gli Operatori
                    </a>
                @endif
            @else
                <a href="{{ route('register') }}" class="btn btn-outline-primary">
                    Registrati per Vedere Tutti
                </a>
            @endauth
        </div>
    </div>
</section>

<!-- How it Works -->
<section class="py-5 bg-light">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="fw-bold">Come Funziona</h2>
            <p class="text-muted">Semplice, veloce e sicuro</p>
        </div>
        
        <div class="row">
            <div class="col-md-4 text-center mb-4">
                <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                    <i class="fas fa-user-plus fa-2x"></i>
                </div>
                <h4>1. Registrati</h4>
                <p class="text-muted">Crea il tuo account gratuito in pochi secondi</p>
            </div>
            <div class="col-md-4 text-center mb-4">
                <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                    <i class="fas fa-search fa-2x"></i>
                </div>
                <h4>2. Scegli un Operatore</h4>
                <p class="text-muted">Trova l'esperto perfetto per le tue esigenze</p>
            </div>
            <div class="col-md-4 text-center mb-4">
                <div class="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                    <i class="fas fa-comments fa-2x"></i>
                </div>
                <h4>3. Inizia la Consulenza</h4>
                <p class="text-muted">Connettiti tramite chat, chiamata o videochiamata</p>
            </div>
        </div>
    </div>
</section>

<!-- Services -->
<section class="py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="fw-bold">I Nostri Servizi</h2>
            <p class="text-muted">Consulenze specializzate per ogni aspetto della tua vita</p>
        </div>
        
        <div class="row">
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 border-0 shadow-sm text-center">
                    <div class="card-body">
                        <i class="fas fa-heart fa-3x text-danger mb-3"></i>
                        <h5>Amore e Relazioni</h5>
                        <p class="text-muted">Consigli per il cuore e le relazioni sentimentali</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 border-0 shadow-sm text-center">
                    <div class="card-body">
                        <i class="fas fa-briefcase fa-3x text-primary mb-3"></i>
                        <h5>Lavoro e Carriera</h5>
                        <p class="text-muted">Orientamento professionale e decisioni lavorative</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 border-0 shadow-sm text-center">
                    <div class="card-body">
                        <i class="fas fa-home fa-3x text-success mb-3"></i>
                        <h5>Famiglia</h5>
                        <p class="text-muted">Supporto per questioni familiari e domestiche</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card h-100 border-0 shadow-sm text-center">
                    <div class="card-body">
                        <i class="fas fa-om fa-3x text-warning mb-3"></i>
                        <h5>Spiritualità</h5>
                        <p class="text-muted">Crescita personale e percorso spirituale</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-5 bg-primary text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <div class="container text-center">
        <h2 class="fw-bold mb-4">Pronto per la tua prima consulenza?</h2>
        <p class="lead mb-4">Unisciti a migliaia di persone che hanno già trovato le risposte che cercavano</p>
        <a href="{{ route('register') }}" class="btn btn-light btn-lg">
            <i class="fas fa-rocket me-2"></i>Inizia Subito
        </a>
    </div>
</section>
@endsection
