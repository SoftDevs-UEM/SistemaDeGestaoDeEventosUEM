<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema; // ✅ ADICIONE ESTA LINHA

class RegistrationController extends Controller
{
    public function store(Request $request)
    {
        Log::info('🎯 === INICIANDO PROCESSO DE INSCRIÇÃO ===');
        Log::info('📦 Dados recebidos:', $request->all());

        // Validação
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|integer|exists:events,id',
            'user_id' => 'required|integer|exists:users,id',
            'pagamento' => 'required|string|max:255',
            'metodo_pagamento' => 'required|string|in:M-Pesa,E-Mola,M-Kesh,NetShop'
        ]);

        if ($validator->fails()) {
            Log::error('❌ VALIDAÇÃO FALHOU:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Dados de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            Log::info('🔄 Transação iniciada');

            // Buscar evento
            $event = Event::find($request->event_id);
            Log::info('🔍 Buscando evento ID: ' . $request->event_id);
            
            if (!$event) {
                Log::error('❌ EVENTO NÃO ENCONTRADO');
                return response()->json([
                    'success' => false,
                    'message' => 'Evento não encontrado'
                ], 404);
            }
            Log::info('✅ Evento encontrado: ' . $event->title);

            // Buscar usuário
            $user = User::find($request->user_id);
            Log::info('🔍 Buscando usuário ID: ' . $request->user_id);
            
            if (!$user) {
                Log::error('❌ USUÁRIO NÃO ENCONTRADO');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ], 404);
            }
            Log::info('✅ Usuário encontrado: ' . $user->name);

            // ✅ VERIFICAÇÃO: Verificar se já está inscrito
            $existingRegistration = Registration::where('event_id', $request->event_id)
                ->where('user_id', $request->user_id)
                ->first();

            if ($existingRegistration) {
                Log::warning('⚠️ USUÁRIO JÁ INSCRITO', [
                    'event_id' => $request->event_id,
                    'user_id' => $request->user_id,
                    'existing_registration_id' => $existingRegistration->id,
                    'numero_inscricao' => $existingRegistration->numero_inscricao
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Você já está inscrito neste evento. Número da inscrição: ' . $existingRegistration->numero_inscricao,
                    'numero_inscricao_existente' => $existingRegistration->numero_inscricao
                ], 422);
            }

            // Verificar vagas disponíveis
            $currentParticipants = Registration::where('event_id', $request->event_id)->count();
            $maxParticipants = $event->max_participants ?? 0;
            
            Log::info("👥 Vagas: {$currentParticipants}/{$maxParticipants}");
            
            if ($currentParticipants >= $maxParticipants) {
                Log::error('🚫 EVENTO LOTADO');
                return response()->json([
                    'success' => false,
                    'message' => 'Evento lotado. Não há vagas disponíveis.'
                ], 422);
            }

            // Criar número de inscrição
            $numeroInscricao = 'INSCR-' . date('YmdHis') . '-' . rand(100, 999);
            Log::info("🎫 Número de inscrição gerado: {$numeroInscricao}");

            // Preparar dados para inscrição
            $registrationData = [
                'numero_inscricao' => $numeroInscricao,
                'event_id' => $request->event_id,
                'user_id' => $request->user_id,
                'nome' => $user->name ?? 'Nome não informado',
                'email' => $user->email ?? 'email@naoinformado.com',
                'telefone' => $user->telefone ?? null,
                'matricula' => $user->nr_estudante ?? null,
                'curso' => $user->curso ?? null,
                'pagamento' => $request->pagamento,
                'metodo_pagamento' => $request->metodo_pagamento,
                'status' => 'confirmado',
                'data_inscricao' => now()
            ];

            Log::info('📋 Dados da inscrição:', $registrationData);

            // Criar a inscrição
// No método store, após criar a inscrição:
$registration = Registration::create($registrationData);
Log::info("✅ Inscrição criada com ID: {$registration->id}");

// ✅ ATUALIZAÇÃO GARANTIDA do contador de participantes
try {
    // Método 1: Usando increment (mais eficiente)
    Event::where('id', $request->event_id)->increment('participants');
    
    // Método 2: Recarregar e verificar (para debug)
    $eventUpdated = Event::find($request->event_id);
    Log::info("👥 Contador ATUALIZADO: {$eventUpdated->participants}/{$eventUpdated->max_participants}");
    
} catch (\Exception $e) {
    Log::error("❌ Erro ao atualizar contador de participantes: " . $e->getMessage());
    // Não quebra o processo principal
}

// Contagem atualizada via relação
$updatedCount = Registration::where('event_id', $request->event_id)->count();
Log::info("👥 Contagem real na tabela registrations: {$updatedCount}");
            DB::commit();
            Log::info('🎉 INSCRIÇÃO CONCLUÍDA COM SUCESSO!');

            return response()->json([
                'success' => true,
                'message' => 'Inscrição realizada com sucesso!',
                'numero_inscricao' => $numeroInscricao,
                'registration' => $registration,
                'current_participants' => $updatedCount,
                'max_participants' => $event->max_participants
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('💥 ERRO CRÍTICO NO PROCESSO DE INSCRIÇÃO');
            Log::error('📄 Mensagem: ' . $e->getMessage());
            Log::error('📍 Arquivo: ' . $e->getFile());
            Log::error('📝 Linha: ' . $e->getLine());
            Log::error('🔍 Stack Trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getByUser($userId)
    {
        try {
            $registrations = Registration::with(['event'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $registrations
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao buscar inscrições do usuário: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar inscrições'
            ], 500);
        }
    }

    public function checkRegistration($eventId, $userId)
    {
        try {
            $registration = Registration::with(['event'])
                ->where('event_id', $eventId)
                ->where('user_id', $userId)
                ->first();
            
            return response()->json([
                'success' => true,
                'is_registered' => !is_null($registration),
                'registration' => $registration
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao verificar inscrição: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar inscrição'
            ], 500);
        }
    }
}