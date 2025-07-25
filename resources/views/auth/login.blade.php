<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accedi - Piattaforma Consulenza</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            padding: 12px;
        }
        .btn-primary:hover {
            background: linear-gradient(45deg, #5a6fd8, #6a4190);
        }
    </style>
</head>
<body>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <div class="card">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <i class="fas fa-crystal-ball fa-3x text-primary mb-3"></i>
                            <h2 class="fw-bold">Accedi al tuo Account</h2>
                            <p class="text-muted">Benvenuto di nuovo!</p>
                        </div>

                        <form method="POST" action="{{ route('login') }}">
                            @csrf

                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" 
                                       class="form-control @error('email') is-invalid @enderror" 
                                       id="email" 
                                       name="email" 
                                       value="{{ old('email') }}" 
                                       required 
                                       autofocus>
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" 
                                       class="form-control @error('password') is-invalid @enderror" 
                                       id="password" 
                                       name="password" 
                                       required>
                                @error('password')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="remember" name="remember">
                                <label class="form-check-label" for="remember">
                                    Ricordami
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary w-100 mb-3">
                                <i class="fas fa-sign-in-alt me-2"></i>Accedi
                            </button>

                            <div class="text-center">
                                <p class="mb-0">
                                    Non hai un account? 
                                    <a href="{{ route('register') }}" class="text-primary text-decoration-none">
                                        Registrati qui
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Demo Accounts -->
                <div class="card mt-4">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Account Demo per Test:</h6>
                        <div class="row text-center">
                            <div class="col-4">
                                <small class="text-muted d-block">Admin</small>
                                <small>admin@consulenza.com</small>
                                <br><small>password123</small>
                            </div>
                            <div class="col-4">
                                <small class="text-muted d-block">Operatore</small>
                                <small>luna@consulenza.com</small>
                                <br><small>password123</small>
                            </div>
                            <div class="col-4">
                                <small class="text-muted d-block">Cliente</small>
                                <small>cliente@consulenza.com</small>
                                <br><small>password123</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
