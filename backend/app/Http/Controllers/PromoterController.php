<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PromoterController extends Controller
{
    // List all promoters (admin only)
    public function index()
    {
        $promoters = User::where('tipo', 'promotor')->get();
        return response()->json($promoters);
    }

    // Store a new promoter (admin only)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'telefone' => 'nullable|string|max:50',
            'departamento' => 'nullable|string|max:255',
            'faculdade' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $promoter = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefone' => $request->telefone,
            'tipo' => 'promotor',
            'departamento' => $request->departamento ?? null,
        ]);

        return response()->json($promoter, 201);
    }

    // Show a promoter
    public function show(User $promoter)
    {
        if ($promoter->tipo !== 'promotor') {
            return response()->json(['message' => 'Not a promoter'], 404);
        }

        return response()->json($promoter);
    }

    // Update promoter (admin only)
    public function update(Request $request, User $promoter)
    {
        if ($promoter->tipo !== 'promotor') {
            return response()->json(['message' => 'Not a promoter'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$promoter->id,
            'password' => 'sometimes|nullable|string|min:6',
            'telefone' => 'nullable|string|max:50',
            'departamento' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $promoter->name = $request->get('name', $promoter->name);
        $promoter->email = $request->get('email', $promoter->email);
        if ($request->filled('password')) {
            $promoter->password = Hash::make($request->password);
        }
        $promoter->telefone = $request->get('telefone', $promoter->telefone);
        $promoter->departamento = $request->get('departamento', $promoter->departamento);

        $promoter->save();

        return response()->json($promoter);
    }

    // Delete promoter (admin only)
    public function destroy(User $promoter)
    {
        if ($promoter->tipo !== 'promotor') {
            return response()->json(['message' => 'Not a promoter'], 404);
        }

        $promoter->delete();

        return response()->json(['message' => 'Promoter deleted']);
    }

    // ✅ ATUALIZADO: Buscar dados do promotor logado
  // ✅ NO MÉTODO getProfile - Garantir que retorna created_at
public function getProfile(Request $request)
{
    $user = $request->user();
    
    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    // Verificar se o usuário é promotor ou admin
    if ($user->tipo !== 'promotor' && $user->tipo !== 'admin') {
        return response()->json(['message' => 'Unauthorized - Apenas promotores e administradores'], 403);
    }

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'telefone' => $user->telefone,
        'tipo' => $user->tipo,
        'departamento' => $user->departamento,
        'created_at' => $user->created_at, // ✅ GARANTIR QUE ESTÁ SENDO RETORNADO
        'updated_at' => $user->updated_at,
    ]);
}

    // ✅ ATUALIZADO: Atualizar perfil do promotor
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Verificar se o usuário é promotor ou admin
        if ($user->tipo !== 'promotor' && $user->tipo !== 'admin') {
            return response()->json(['message' => 'Unauthorized - Apenas promotores e administradores'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'telefone' => 'nullable|string|max:50',
            'departamento' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user->name = $request->name;
            $user->email = $request->email;
            $user->telefone = $request->telefone;
            $user->departamento = $request->departamento;

            $user->save();

            return response()->json([
                'message' => 'Perfil atualizado com sucesso!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'telefone' => $user->telefone,
                    'tipo' => $user->tipo,
                    'departamento' => $user->departamento,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ ATUALIZADO: Alterar senha do promotor
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Verificar se o usuário é promotor ou admin
        if ($user->tipo !== 'promotor' && $user->tipo !== 'admin') {
            return response()->json(['message' => 'Unauthorized - Apenas promotores e administradores'], 403);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar senha atual
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'A senha atual está incorreta'
            ], 422);
        }

        try {
            // Atualizar senha
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'message' => 'Senha alterada com sucesso!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao alterar senha',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}