@extends('layouts.app')

@section('title', 'Registrati - Piattaforma Consulenza')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card">
                <div class="card-body p-5">
                    <div class="text-center mb-4">
                        <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
                        <h2 class="fw-bold">Crea il tuo Account</h2>
                        <p class="text-muted">Unisciti alla nostra community!</p>
                    </div>

                    <form method="POST" action="{{ route('register') }}">
                        @csrf

                        <div class="mb-3">
                            <label for="name" class="form-label">Nome Completo</label>
                            <input type="text" 
                                   class="form-control @error('name') is-invalid @enderror" 
                                   id="name" 
                                   name="name" 
                                   value="{{ old('name') }}" 
                                   required 
                                   autofocus>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" 
                                   class="form-control @error('email') is-invalid @enderror" 
                                   id="email" 
                                   name="email" 
                                   value="{{ old('email') }}" 
                                   required>
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
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
                            <div class="col-md-6 mb-3">
                                <label for="password_confirmation" class="form-label">Conferma Password</label>
                                <input type="password" 
                                       class="form-control" 
                                       id="password_confirmation" 
                                       name="password_confirmation" 
                                       required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="role" class="form-label">Tipo di Account</label>
                            <select class="form-select @error('role') is-invalid @enderror" 
                                    id="role" 
                                    name="role" 
                                    required>
                                <option value="">Seleziona...</option>
                                <option value="client" {{ old('role') == 'client' ? 'selected' : '' }}>
                                    Cliente - Cerco consulenze
                                </option>
                                <option value="operator" {{ old('role') == 'operator' ? 'selected' : '' }}>
                                    Operatore - Offro consulenze
                                </option>
                            </select>
                            @error('role')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="phone" class="form-label">Telefono (Opzionale)</label>
                            <input type="tel" 
                                   class="form-control @error('phone') is-invalid @enderror" 
                                   id="phone" 
                                   name="phone" 
                                   value="{{ old('phone') }}">
                            @error('phone')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Operator specific fields -->
                        <div id="operator-fields" style="display: none;">
                            <div class="mb-3">
                                <label for="bio" class="form-label">Biografia</label>
                                <textarea class="form-control @error('bio') is-invalid @enderror" 
                                          id="bio" 
                                          name="bio" 
                                          rows="3" 
                                          placeholder="Descrivi la tua esperienza e specializzazioni...">{{ old('bio') }}</textarea>
                                @error('bio')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="hourly_rate" class="form-label">Tariffa Oraria (€)</label>
                                <input type="number" 
                                       class="form-control @error('hourly_rate') is-invalid @enderror" 
                                       id="hourly_rate" 
                                       name="hourly_rate" 
                                       value="{{ old('hourly_rate') }}" 
                                       min="1" 
                                       max="500" 
                                       step="0.01">
                                @error('hourly_rate')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Specializzazioni</label>
                                <div class="row">
                                    @php
                                        $specialties = ['Astrologia', 'Tarocchi', 'Cartomanzia', 'Numerologia', 'Cristalloterapia', 'Reiki', 'Medianità'];
                                    @endphp
                                    @foreach($specialties as $specialty)
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" 
                                                       type="checkbox" 
                                                       name="specialties[]" 
                                                       value="{{ $specialty }}" 
                                                       id="specialty_{{ $loop->index }}"
                                                       {{ in_array($specialty, old('specialties', [])) ? 'checked' : '' }}>
                                                <label class="form-check-label" for="specialty_{{ $loop->index }}">
                                                    {{ $specialty }}
                                                </label>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 mb-3">
                            <i class="fas fa-user-plus me-2"></i>Registrati
                        </button>

                        <div class="text-center">
                            <p class="mb-0">
                                Hai già un account? 
                                <a href="{{ route('login') }}" class="text-primary text-decoration-none">
                                    Accedi qui
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('role').addEventListener('change', function() {
    const operatorFields = document.getElementById('operator-fields');
    if (this.value === 'operator') {
        operatorFields.style.display = 'block';
    } else {
        operatorFields.style.display = 'none';
    }
});

// Show operator fields if already selected
if (document.getElementById('role').value === 'operator') {
    document.getElementById('operator-fields').style.display = 'block';
}
</script>
@endsection
