<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'telefone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:6|confirmed',
            'tipo' => 'required|in:estudante,docente,cta',
            'nr_estudante' => 'required_if:tipo,estudante',
            'curso' => 'required_if:tipo,estudante',
            'departamento' => 'required_if:tipo,docente',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $usuario = Usuario::create([
            'nome' => $request->nome,
            'telefone' => $request->telefone,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tipo' => $request->tipo,
            'nr_estudante' => $request->nr_estudante,
            'curso' => $request->curso,
            'departamento' => $request->departamento,
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'usuario' => $usuario
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Verificar contas padrão do sistema PRIMEIRO
        $contasPadrao = [
            'estudante@uem.ac.mz' => '123',
            'promotor@uem.ac.mz' => '123', 
            'admin@uem.ac.mz' => '123'
        ];

        if (array_key_exists($request->email, $contasPadrao)) {
            if ($request->password !== $contasPadrao[$request->email]) {
                return response()->json(['message' => 'Credenciais inválidas'], 401);
            }
            
            // Verificar se a conta padrão já existe
            $usuario = Usuario::where('email', $request->email)->first();
            
            // Se não existe, criar
            if (!$usuario) {
                $usuario = Usuario::create([
                    'nome' => $this->getNomeContaPadrao($request->email),
                    'telefone' => '000000000',
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'tipo' => $this->getTipoContaPadrao($request->email),
                ]);
            }
        } else {
            // Verificar usuários normais
            $usuario = Usuario::where('email', $request->email)->first();

            if (!$usuario || !Hash::check($request->password, $usuario->password)) {
                return response()->json(['message' => 'Credenciais inválidas'], 401);
            }
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'usuario' => $usuario
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Métodos auxiliares para contas padrão
    private function getNomeContaPadrao($email)
    {
        $nomes = [
            'estudante@uem.ac.mz' => 'Estudante UEM',
            'promotor@uem.ac.mz' => 'Promotor UEM', 
            'admin@uem.ac.mz' => 'Administrador UEM'
        ];
        
        return $nomes[$email] ?? 'Usuário UEM';
    }

    private function getTipoContaPadrao($email)
    {
        $tipos = [
            'estudante@uem.ac.mz' => 'estudante',
            'promotor@uem.ac.mz' => 'docente',
            'admin@uem.ac.mz' => 'cta'
        ];
        
        return $tipos[$email] ?? 'estudante';
    }
}