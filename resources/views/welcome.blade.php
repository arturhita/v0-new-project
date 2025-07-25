<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulenza Online - La tua piattaforma di fiducia</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 100px 0;
        }
        .operator-card {
            transition: transform 0.3s;
            border: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .operator-card:hover {
            transform: translateY(-5px);
        }
        .stats-section {
            background: #f8f9fa;
            padding: 60px 0;
        }
        .review-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem;
        }
        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
        }
        .btn-primary:hover {
            background: linear-gradient(45deg, #5a6fd8, #6a4190);
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <a class="navbar-brand text-primary" href="{{ route('home') }}">
                <i class="fas fa-star me-2"></i>Consulenza Online
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#operatori">Operatori</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#come-funziona">Come Funziona</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#recensioni">Recensioni</a>
                    </li>
                </ul>
                
                <ul class="navbar-nav">
                    @guest
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('login') }}">Accedi</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-primary ms-2" href="{{ route('register') }}">Registrati</a>
                        </li>
                    @else
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                {{ Auth::user()->name }}
                            </a>
                            <ul class="dropdown-menu">
                                @if(Auth::user()->role === 'admin')
                                    <li><a class="dropdown-item" href="{{ route('admin.dashboard') }}">Dashboard Admin</a></li>
                                @elseif(Auth::user()->role === 'operator')
                                    <li><a class="dropdown-item" href="{{ route('operator.dashboard') }}">Dashboard Operatore</a></li>
                                @else
                                    <li><a class="dropdown-item" href="{{ route('client.dashboard') }}">Dashboard Cliente</a></li>
                                @endif
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button type="submit" class="dropdown-item">Logout</button>
                                    </form>
                                </li>
                            </ul>
                        </li>
                    @endguest
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-4">Consulenza Online Professionale</h1>
                    <p class="lead mb-4">Connettiti con esperti qualificati per consulenze personalizzate. Chat, chiamate e videochiamate disponibili 24/7.</p>
                    <div class="d-flex gap-3">
                        <a href="{{ route('register') }}" class="btn btn-light btn-lg">Inizia Ora</a>
                        <a href="#operatori" class="btn btn-outline-light btn-lg">Trova un Esperto</a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="text-center">
                        <i class="fas fa-comments fa-10x opacity-75"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
        <div class="container">
            <div class="row text-center">
                <div class="col-md-3 mb-4">
                    <div class="h2 text-primary fw-bold">{{ number_format($stats['total_operators']) }}</div>
                    <p class="text-muted">Esperti Qualificati</p>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="h2 text-primary fw-bold">{{ number_format($stats['total_consultations']) }}</div>
                    <p class="text-muted">Consulenze Completate</p>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="h2 text-primary fw-bold">{{ number_format($stats['average_rating'], 1) }}/5</div>
                    <p class="text-muted">Valutazione Media</p>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="h2 text-primary fw-bold">{{ number_format($stats['total_clients']) }}</div>
                    <p class="text-muted">Clienti Soddisfatti</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Top Operators Section -->
    <section id="operatori" class="py-5">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold">I Nostri Migliori Esperti</h2>
                <p class="lead text-muted">Professionisti qualificati pronti ad aiutarti</p>
            </div>
            
            <div class="row">
                @foreach($topOperators as $operator)
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card operator-card h-100">
                        <div class="card-body text-center">
                            <div class="mb-3">
                                @if($operator->avatar)
                                    <img src="{{ Storage::url($operator->avatar) }}" class="rounded-circle" width="80" height="80" alt="{{ $operator->name }}">
                                @else
                                    <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                        <i class="fas fa-user fa-2x text-white"></i>
                                    </div>
                                @endif
                            </div>
                            
                            <h5 class="card-title">{{ $operator->name }}</h5>
                            <p class="text-muted">{{ $operator->specialization ?? 'Consulente Generale' }}</p>
                            
                            <div class="mb-3">
                                @if($operator->received_reviews_avg_rating)
                                    @for($i = 1; $i <= 5; $i++)
                                        @if($i <= $operator->received_reviews_avg_rating)
                                            <i class="fas fa-star text-warning"></i>
                                        @else
                                            <i class="far fa-star text-warning"></i>
                                        @endif
                                    @endfor
                                    <span class="ms-2 text-muted">({{ $operator->received_reviews_count }} recensioni)</span>
                                @else
                                    <span class="text-muted">Nessuna recensione</span>
                                @endif
                            </div>
                            
                            <p class="card-text">{{ Str::limit($operator->bio ?? 'Esperto qualificato pronto ad aiutarti con le tue esigenze.', 100) }}</p>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-primary">€{{ number_format($operator->rate_per_minute ?? 2.50, 2) }}/min</span>
                                <a href="{{ route('public.operator', $operator) }}" class="btn btn-primary btn-sm">Consulta Ora</a>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
            
            <div class="text-center mt-4">
                <a href="{{ route('client.operators') }}" class="btn btn-outline-primary btn-lg">Vedi Tutti gli Esperti</a>
            </div>
        </div>
    </section>

    <!-- How it Works Section -->
    <section id="come-funziona" class="py-5 bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold">Come Funziona</h2>
                <p class="lead text-muted">Semplice, veloce e sicuro</p>
            </div>
            
            <div class="row">
                <div class="col-md-4 text-center mb-4">
                    <div class="mb-3">
                        <i class="fas fa-user-plus fa-3x text-primary"></i>
                    </div>
                    <h4>1. Registrati</h4>
                    <p class="text-muted">Crea il tuo account gratuito in pochi secondi</p>
                </div>
                
                <div class="col-md-4 text-center mb-4">
                    <div class="mb-3">
                        <i class="fas fa-search fa-3x text-primary"></i>
                    </div>
                    <h4>2. Trova un Esperto</h4>
                    <p class="text-muted">Scegli tra centinaia di professionisti qualificati</p>
                </div>
                
                <div class="col-md-4 text-center mb-4">
                    <div class="mb-3">
                        <i class="fas fa-comments fa-3x text-primary"></i>
                    </div>
                    <h4>3. Inizia la Consulenza</h4>
                    <p class="text-muted">Chat, chiamata o videochiamata quando vuoi</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Reviews Section -->
    <section id="recensioni" class="py-5">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold">Cosa Dicono i Nostri Clienti</h2>
                <p class="lead text-muted">Testimonianze reali dai nostri utenti</p>
            </div>
            
            <div class="row">
                @foreach($latestReviews as $review)
                <div class="col-md-4 mb-4">
                    <div class="review-card">
                        <div class="mb-3">
                            @for($i = 1; $i <= 5; $i++)
                                @if($i <= $review->rating)
                                    <i class="fas fa-star text-warning"></i>
                                @else
                                    <i class="far fa-star text-warning"></i>
                                @endif
                            @endfor
                        </div>
                        
                        <p class="mb-3">"{{ $review->comment }}"</p>
                        
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                @if($review->client->avatar)
                                    <img src="{{ Storage::url($review->client->avatar) }}" class="rounded-circle" width="40" height="40" alt="{{ $review->client->name }}">
                                @else
                                    <div class="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                        <i class="fas fa-user text-white"></i>
                                    </div>
                                @endif
                            </div>
                            <div>
                                <div class="fw-bold">{{ $review->client->name }}</div>
                                <small class="text-muted">Consulenza con {{ $review->operator->name }}</small>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-5 bg-primary text-white">
        <div class="container text-center">
            <h2 class="display-5 fw-bold mb-4">Pronto per Iniziare?</h2>
            <p class="lead mb-4">Unisciti a migliaia di persone che hanno già trovato le risposte che cercavano</p>
            <div class="d-flex justify-content-center gap-3">
                <a href="{{ route('register') }}" class="btn btn-light btn-lg">Registrati Gratis</a>
                <a href="{{ route('client.operators') }}" class="btn btn-outline-light btn-lg">Trova un Esperto</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Consulenza Online</h5>
                    <p class="text-muted">La piattaforma di consulenza online più affidabile d'Italia. Connetti con esperti qualificati 24/7.</p>
                </div>
                
                <div class="col-md-2 mb-4">
                    <h6 class="fw-bold mb-3">Servizi</h6>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Chat</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Chiamate</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Video</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Email</a></li>
                    </ul>
                </div>
                
                <div class="col-md-2 mb-4">
                    <h6 class="fw-bold mb-3">Supporto</h6>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Centro Aiuto</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Contatti</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">FAQ</a></li>
                    </ul>
                </div>
                
                <div class="col-md-2 mb-4">
                    <h6 class="fw-bold mb-3">Legale</h6>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Privacy</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Termini</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Cookie</a></li>
                    </ul>
                </div>
                
                <div class="col-md-2 mb-4">
                    <h6 class="fw-bold mb-3">Social</h6>
                    <div class="d-flex gap-2">
                        <a href="#" class="text-muted"><i class="fab fa-facebook fa-lg"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-twitter fa-lg"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-instagram fa-lg"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-linkedin fa-lg"></i></a>
                    </div>
                </div>
            </div>
            
            <hr class="my-4">
            
            <div class="row align-items-center">
                <div class="col-md-6">
                    <p class="text-muted mb-0">&copy; {{ date('Y') }} Consulenza Online. Tutti i diritti riservati.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="text-muted mb-0">Made with <i class="fas fa-heart text-danger"></i> in Italy</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
