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
}
