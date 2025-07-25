@extends('layouts.app')

@section('title', 'Benvenuto - Piattaforma Consulenza')

@section('content')
<!-- Hero Section -->
<section class="hero-section">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold mb-4">
                    Trova il Tuo Consulente Spirituale
                </h1>
                <p class="lead mb-4">
                    Connettiti con esperti qualificati in astrologia, tarocchi, cartomanzia e molto altro. 
                    Consulenze online sicure e professionali.
                </p>
                <div class="d-flex gap-3">
                    @guest
                        <a href="{{ route('register') }}" class="btn btn-primary btn-lg">
                            <i class="fas fa-user-plus me-2"></i>Inizia Ora
                        </a>
                        <a href="{{ route('client.operators') }}" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-search me-2"></i>Trova Operatori
                        </a>
                    @else
                        @if(Auth::user()->isClient())
                            <a href="{{ route('client.operators') }}" class="btn btn-primary btn-lg">
                                <i class="fas fa-search me-2"></i>Trova Operatori
                            </a>
                        @endif
                    @endguest
                </div>
            </div>
            <div class="col-lg-6">
                <div class="text-center">
                    <i class="fas fa-crystal-ball" style="font-size: 200px; opacity: 0.3;"></i>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="py-5 bg-white">
    <div class="container">
        <div class="row text-center">
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <i class="fas fa-users fa-3x text-primary mb-3"></i>
                        <h3 class="fw-bold">{{ $stats['total_operators'] }}</h3>
                        <p class="text-muted">Operatori Attivi</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <i class="fas fa-comments fa-3x text-success mb-3"></i>
                        <h3 class="fw-bold">{{ number_format($stats['total_consultations']) }}</h3>
                        <p class="text-muted">Consulenze Completate</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <i class="fas fa-star fa-3x text-warning mb-3"></i>
                        <h3 class="fw-bold">{{ number_format($stats['average_rating'], 1) }}</h3>
                        <p class="text-muted">Valutazione Media</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <i class="fas fa-circle fa-3x text-success mb-3"></i>
                        <h3 class="fw-bold">{{ $stats['online_operators'] }}</h3>
                        <p class="text-muted">Online Ora</p>
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
            <h2 class="fw-bold text-white">I Nostri Migliori Operatori</h2>
            <p class="text-white-50">Esperti qualificati pronti ad aiutarti</p>
        </div>
        
        <div class="row">
            @foreach($featuredOperators as $operator)
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card operator-card h-100">
                        <div class="card-body text-center">
                            @if($operator->avatar)
                                <img src="{{ Storage::url($operator->avatar) }}" 
                                     class="rounded-circle mb-3" 
                                     width="80" height="80" 
                                     style="object-fit: cover;">
                            @else
                                <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                     style="width: 80px; height: 80px;">
                                    <i class="fas fa-user fa-2x text-white"></i>
                                </div>
                            @endif
                            
                            <h5 class="card-title">
                                {{ $operator->name }}
                                @if($operator->is_online)
                                    <span class="online-indicator"></span>
                                @endif
                            </h5>
                            
                            <p class="text-muted small">
                                {{ Str::limit($operator->bio, 80) }}
                            </p>
                            
                            <div class="rating-stars mb-2">
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= $operator->average_rating)
                                        <i class="fas fa-star"></i>
                                    @else
                                        <i class="far fa-star"></i>
                                    @endif
                                @endfor
                                <small class="text-muted ms-1">({{ $operator->reviews_count }})</small>
                            </div>
                            
                            <p class="fw-bold text-primary">
                                €{{ number_format($operator->hourly_rate, 2) }}/ora
                            </p>
                            
                            @if($operator->specialties)
                                <div class="mb-3">
                                    @foreach(array_slice($operator->specialties, 0, 2) as $specialty)
                                        <span class="badge bg-light text-dark me-1">{{ $specialty }}</span>
                                    @endforeach
                                </div>
                            @endif
                            
                            @auth
                                @if(Auth::user()->isClient())
                                    <a href="{{ route('client.operator.show', $operator) }}" 
                                       class="btn btn-primary btn-sm">
                                        <i class="fas fa-eye me-1"></i>Visualizza Profilo
                                    </a>
                                @endif
                            @else
                                <a href="{{ route('login') }}" class="btn btn-primary btn-sm">
                                    <i class="fas fa-sign-in-alt me-1"></i>Accedi per Prenotare
                                </a>
                            @endauth
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
        
        <div class="text-center mt-4">
            @auth
                @if(Auth::user()->isClient())
                    <a href="{{ route('client.operators') }}" class="btn btn-outline-light btn-lg">
                        <i class="fas fa-users me-2"></i>Vedi Tutti gli Operatori
                    </a>
                @endif
            @else
                <a href="{{ route('client.operators') }}" class="btn btn-outline-light btn-lg">
                    <i class="fas fa-users me-2"></i>Vedi Tutti gli Operatori
                </a>
            @endauth
        </div>
    </div>
</section>

<!-- Recent Reviews -->
@if($recentReviews->count() > 0)
<section class="py-5 bg-white">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="fw-bold">Cosa Dicono i Nostri Clienti</h2>
            <p class="text-muted">Recensioni autentiche dai nostri utenti</p>
        </div>
        
        <div class="row">
            @foreach($recentReviews as $review)
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="me-3">
                                    @if($review->client->avatar)
                                        <img src="{{ Storage::url($review->client->avatar) }}" 
                                             class="rounded-circle" 
                                             width="50" height="50" 
                                             style="object-fit: cover;">
                                    @else
                                        <div class="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center" 
                                             style="width: 50px; height: 50px;">
                                            <i class="fas fa-user text-white"></i>
                                        </div>
                                    @endif
                                </div>
                                <div>
                                    <h6 class="mb-0">{{ $review->client->name }}</h6>
                                    <div class="rating-stars">
                                        @for($i = 1; $i <= 5; $i++)
                                            @if($i <= $review->rating)
                                                <i class="fas fa-star"></i>
                                            @else
                                                <i class="far fa-star"></i>
                                            @endif
                                        @endfor
                                    </div>
                                </div>
                            </div>
                            <p class="text-muted">{{ Str::limit($review->comment, 120) }}</p>
                            <small class="text-muted">
                                Consulenza con {{ $review->operator->name }} - 
                                {{ $review->created_at->diffForHumans() }}
                            </small>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif

<!-- How It Works -->
<section class="py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h2 class="fw-bold text-white">Come Funziona</h2>
            <p class="text-white-50">Semplice, veloce e sicuro</p>
        </div>
        
        <div class="row">
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                             style="width: 80px; height: 80px;">
                            <i class="fas fa-user-plus fa-2x text-white"></i>
                        </div>
                        <h5 class="fw-bold">1. Registrati</h5>
                        <p class="text-muted">Crea il tuo account gratuito in pochi secondi</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <div class="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                             style="width: 80px; height: 80px;">
                            <i class="fas fa-search fa-2x text-white"></i>
                        </div>
                        <h5 class="fw-bold">2. Scegli l'Operatore</h5>
                        <p class="text-muted">Trova l'esperto perfetto per le tue esigenze</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <div class="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                             style="width: 80px; height: 80px;">
                            <i class="fas fa-comments fa-2x text-white"></i>
                        </div>
                        <h5 class="fw-bold">3. Inizia la Consulenza</h5>
                        <p class="text-muted">Chat, chiamata o videochiamata in tempo reale</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-5 bg-white">
    <div class="container text-center">
        <h2 class="fw-bold mb-4">Pronto per la Tua Prima Consulenza?</h2>
        <p class="lead text-muted mb-4">
            Unisciti a migliaia di persone che hanno già trovato le risposte che cercavano
        </p>
        @guest
            <div class="d-flex justify-content-center gap-3">
                <a href="{{ route('register') }}" class="btn btn-primary btn-lg">
                    <i class="fas fa-user-plus me-2"></i>Registrati Gratis
                </a>
                <a href="{{ route('register') }}?role=operator" class="btn btn-outline-primary btn-lg">
                    <i class="fas fa-star me-2"></i>Diventa Operatore
                </a>
            </div>
        @endguest
    </div>
</section>
@endsection
