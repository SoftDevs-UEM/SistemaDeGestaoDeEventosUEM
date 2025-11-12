<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    // ✅ MÉTODO INDEX - LISTAR TODOS OS EVENTOS
    public function index(Request $request)
    {
        try {
            Log::info('🎯 EVENT CONTROLLER INDEX CHAMADO - LISTAR TODOS OS EVENTOS', [
                'user_authenticated' => Auth::check(),
                'user_type' => Auth::check() ? Auth::user()->tipo : 'guest',
                'ip' => $request->ip()
            ]);

            // ✅ DEBUG: Verificar todos os eventos no banco primeiro
            $allEvents = Event::with('promoter')->get();
            Log::info('📊 TODOS OS EVENTOS NO BANCO DE DADOS:', [
                'total' => $allEvents->count(),
                'events' => $allEvents->map(function($event) {
                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'status' => $event->status,
                        'date' => $event->date,
                        'promoter_id' => $event->promoter_id,
                        'deleted_at' => $event->deleted_at
                    ];
                })->toArray()
            ]);

            $user = $request->user();
            $query = Event::query();

            // ✅ LÓGICA SIMPLIFICADA - SEM FILTRO POR STATUS
            if ($user) {
                Log::info('👤 USUÁRIO AUTENTICADO', ['tipo' => $user->tipo, 'id' => $user->id]);
                
                if ($user->tipo === 'promotor') {
                    // Promotor vê apenas seus próprios eventos (não deletados)
                    $query->where('promoter_id', $user->id)
                          ->whereNull('deleted_at');
                    Log::info('🔍 FILTRO: Promotor vendo seus eventos');
                } else if ($user->tipo === 'admin') {
                    // Admin vê todos os eventos (não deletados)
                    $query->whereNull('deleted_at');
                    Log::info('🔍 FILTRO: Admin vendo todos os eventos');
                } else {
                    // Estudante vê TODOS os eventos não deletados
                    $query->whereNull('deleted_at')
                          ->where('date', '>=', now()->format('Y-m-d'));
                    Log::info('🔍 FILTRO: Estudante vendo TODOS os eventos futuros');
                }
            } else {
                // Visitante vê TODOS os eventos não deletados
                $query->whereNull('deleted_at')
                      ->where('date', '>=', now()->format('Y-m-d'));
                Log::info('🔍 FILTRO: Visitante vendo TODOS os eventos futuros');
            }

            // ✅ CARREGAR RELACIONAMENTOS E CONTAGEM
            $events = $query->withCount('registrations as participants_count')
                          ->with('promoter:id,name,email')
                          ->orderBy('date', 'asc')
                          ->get();

            Log::info('📈 EVENTOS APÓS FILTRO (SEM STATUS):', [
                'count' => $events->count(),
                'events' => $events->map(function($event) {
                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'status' => $event->status,
                        'date' => $event->date,
                        'participants_count' => $event->participants_count,
                        'promoter_name' => $event->promoter->name ?? 'N/A'
                    ];
                })->toArray()
            ]);

            // ✅ FORMATAR RESPOSTA
            $formattedEvents = $events->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'date' => $event->date,
                    'time' => $event->time,
                    'location' => $event->location,
                    'type' => $event->type,
                    'category' => $event->category,
                    'max_participants' => $event->max_participants,
                    'promoter_id' => $event->promoter_id,
                    'status' => $event->status,
                    'image' => $event->image,
                    'requirements' => $event->requirements,
                    'target_audience' => $event->target_audience,
                    'feedback' => $event->feedback,
                    'created_at' => $event->created_at?->toISOString(),
                    'updated_at' => $event->updated_at?->toISOString(),
                    'deleted_at' => $event->deleted_at?->toISOString(),
                    'participants_count' => $event->participants_count ?? 0,
                    'participants' => $event->participants_count ?? 0,
                    'promoter_name' => $event->promoter->name ?? 'Promotor',
                ];
            });

            Log::info('✅ RESPOSTA FINAL DA API - TODOS OS EVENTOS:', [
                'total_events' => $formattedEvents->count(),
                'events_returned' => $formattedEvents->toArray()
            ]);

            return response()->json($formattedEvents);

        } catch (\Exception $e) {
            Log::error('💥 ERRO CRÍTICO NO EVENT CONTROLLER:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro interno do servidor',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno'
            ], 500);
        }
    }

    // ✅ MÉTODO SHOW
    public function show($id)
    {
        try {
            Log::info('🔍 BUSCANDO EVENTO ESPECÍFICO', ['event_id' => $id]);
            
            $event = Event::withCount('registrations as participants_count')
                         ->with('promoter:id,name')
                         ->find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Evento não encontrado'], 404);
            }

            $user = Auth::user();
            
            if ($user && $user->tipo === 'promotor' && $event->promoter_id !== $user->id) {
                return response()->json(['message' => 'Não autorizado a visualizar este evento'], 403);
            }

            $formattedEvent = [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at?->toISOString(),
                'participants_count' => $event->participants_count ?? 0,
                'participants' => $event->participants_count ?? 0,
                'promoter_name' => $event->promoter->name ?? 'Promotor',
            ];

            return response()->json($formattedEvent);

        } catch (\Exception $e) {
            Log::error('Erro ao buscar evento:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro interno do servidor'], 500);
        }
    }

    // ✅ MÉTODO STORE
    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user || ($user->tipo !== 'promotor' && $user->tipo !== 'admin')) {
            return response()->json(['message' => 'Não autorizado a criar eventos'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|string',
            'location' => 'required|string|max:255',
            'type' => 'required|in:academico,cultural,desportivo',
            'category' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'target_audience' => 'nullable|string|max:255',
            'requirements' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $event = Event::create([
                'title' => $request->title,
                'description' => $request->description,
                'date' => $request->date,
                'time' => $request->time,
                'location' => $request->location,
                'type' => $request->type,
                'category' => $request->category,
                'max_participants' => $request->max_participants,
                'target_audience' => $request->target_audience,
                'requirements' => $request->requirements,
                'image' => $request->image,
                'promoter_id' => $user->id,
                'status' => 'pendente',
            ]);

            $formattedEvent = [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at,
                'participants_count' => 0,
                'participants' => 0,
                'promoter_name' => $user->name,
            ];

            return response()->json($formattedEvent, 201);

        } catch (\Exception $e) {
            Log::error('Erro ao criar evento:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erro ao criar evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ MÉTODO UPDATE
    public function update(Request $request, $id)
    {
        $event = Event::with('promoter:id,name')->find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento não encontrado'], 404);
        }

        $user = $request->user();
        
        if ($user && $user->tipo === 'promotor' && $event->promoter_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado a atualizar este evento'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'date' => 'sometimes|required|date|after_or_equal:today',
            'time' => 'sometimes|required|string',
            'location' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:academico,cultural,desportivo',
            'category' => 'sometimes|required|string|max:255',
            'max_participants' => 'sometimes|required|integer|min:1',
            'target_audience' => 'nullable|string|max:255',
            'requirements' => 'nullable|string',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:pendente,ativo,cancelado',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $event->update($request->all());

            $formattedEvent = [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at?->toISOString(),
                'participants_count' => $event->registrations()->count(),
                'participants' => $event->registrations()->count(),
                'promoter_name' => $event->promoter->name ?? 'Promotor',
            ];

            return response()->json([
                'message' => 'Evento atualizado com sucesso',
                'event' => $formattedEvent
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao atualizar evento:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erro ao atualizar evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ MÉTODO DESTROY
    public function destroy($id)
    {
        $event = Event::find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento não encontrado'], 404);
        }

        $user = Auth::user();
        
        if ($user && $user->tipo === 'promotor' && $event->promoter_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado a arquivar este evento'], 403);
        }

        try {
            $event->update([
                'deleted_at' => now(),
                'status' => 'cancelado'
            ]);

            return response()->json(['message' => 'Evento arquivado com sucesso']);

        } catch (\Exception $e) {
            Log::error('Erro ao arquivar evento:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erro ao arquivar evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ MÉTODO RESTORE
    public function restore($id)
    {
        $event = Event::withTrashed()->find($id);
        
        if (!$event) {
            return response()->json(['message' => 'Evento não encontrado'], 404);
        }

        $user = Auth::user();
        
        if ($user && $user->tipo === 'promotor' && $event->promoter_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado a restaurar este evento'], 403);
        }

        try {
            $event->update([
                'deleted_at' => null,
                'status' => 'pendente'
            ]);

            return response()->json(['message' => 'Evento restaurado com sucesso']);

        } catch (\Exception $e) {
            Log::error('Erro ao restaurar evento:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erro ao restaurar evento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ MÉTODO GET BY STATUS
    public function getByStatus($status)
    {
        $user = Auth::user();
        
        $query = Event::where('status', $status);
        
        if ($user && $user->tipo === 'promotor') {
            $query->where('promoter_id', $user->id);
        }
        
        $events = $query->whereNull('deleted_at')
                       ->withCount('registrations as participants_count')
                       ->with('promoter:id,name')
                       ->orderBy('date', 'asc')
                       ->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at?->toISOString(),
                'participants_count' => $event->participants_count ?? 0,
                'participants' => $event->participants_count ?? 0,
                'promoter_name' => $event->promoter->name ?? 'Promotor',
            ];
        });

        return response()->json($formattedEvents);
    }

    // ✅ MÉTODO ARCHIVED
    public function archived()
    {
        $user = Auth::user();
        
        $query = Event::whereNotNull('deleted_at');
        
        if ($user && $user->tipo === 'promotor') {
            $query->where('promoter_id', $user->id);
        }
        
        $events = $query->withCount('registrations as participants_count')
                       ->with('promoter:id,name')
                       ->orderBy('deleted_at', 'desc')
                       ->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at?->toISOString(),
                'participants_count' => $event->participants_count ?? 0,
                'participants' => $event->participants_count ?? 0,
                'promoter_name' => $event->promoter->name ?? 'Promotor',
            ];
        });

        return response()->json($formattedEvents);
    }

    // ✅ MÉTODO GET BY TYPE
    public function getByType($type)
    {
        $events = Event::where('type', $type)
                     ->whereNull('deleted_at')
                     ->where('date', '>=', now()->format('Y-m-d'))
                     ->withCount('registrations as participants_count')
                     ->with('promoter:id,name')
                     ->orderBy('date', 'asc')
                     ->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at?->toISOString(),
                'participants_count' => $event->participants_count ?? 0,
                'participants' => $event->participants_count ?? 0,
                'promoter_name' => $event->promoter->name ?? 'Promotor',
            ];
        });

        return response()->json($formattedEvents);
    }

    // ✅ MÉTODO SEARCH
    public function search(Request $request)
    {
        $query = Event::whereNull('deleted_at')
                     ->where('date', '>=', now()->format('Y-m-d'));

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('date') && $request->date) {
            $query->where('date', $request->date);
        }

        $events = $query->withCount('registrations as participants_count')
                       ->with('promoter:id,name')
                       ->orderBy('date', 'asc')
                       ->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'time' => $event->time,
                'location' => $event->location,
                'type' => $event->type,
                'category' => $event->category,
                'max_participants' => $event->max_participants,
                'promoter_id' => $event->promoter_id,
                'status' => $event->status,
                'image' => $event->image,
                'requirements' => $event->requirements,
                'target_audience' => $event->target_audience,
                'feedback' => $event->feedback,
                'created_at' => $event->created_at?->toISOString(),
                'updated_at' => $event->updated_at?->toISOString(),
                'deleted_at' => $event->deleted_at?->toISOString(),
                'participants_count' => $event->participants_count ?? 0,
                'participants' => $event->participants_count ?? 0,
                'promoter_name' => $event->promoter->name ?? 'Promotor',
            ];
        });

        return response()->json($formattedEvents);
    }

    // ✅ MÉTODO DEBUG EVENTS
    public function debugEvents(Request $request)
    {
        Log::info('🐛 DEBUG EVENTS ENDPOINT CHAMADO - VERIFICAR TODOS OS EVENTOS');
        
        // 1. Todos os eventos sem filtro
        $allEvents = Event::with('promoter')->get();
        
        // 2. Eventos não deletados (o que usamos agora)
        $notDeletedEvents = Event::whereNull('deleted_at')->get();
        
        // 3. Eventos com data futura
        $futureEvents = Event::where('date', '>=', now()->format('Y-m-d'))->get();
        
        // 4. Eventos que devem aparecer para visitantes (COM A NOVA LÓGICA)
        $visitorEvents = Event::whereNull('deleted_at')
                            ->where('date', '>=', now()->format('Y-m-d'))
                            ->get();

        return response()->json([
            'debug_info' => [
                'total_events_in_database' => $allEvents->count(),
                'not_deleted_events' => $notDeletedEvents->count(),
                'future_events' => $futureEvents->count(),
                'visitor_events_new_logic' => $visitorEvents->count(),
            ],
            'all_events' => $allEvents->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'status' => $event->status,
                    'date' => $event->date,
                    'deleted_at' => $event->deleted_at,
                    'promoter_id' => $event->promoter_id,
                    'promoter_name' => $event->promoter->name ?? 'N/A'
                ];
            }),
            'visitor_events_details' => $visitorEvents->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'status' => $event->status,
                    'date' => $event->date,
                    'deleted_at' => $event->deleted_at
                ];
            })
        ]);
    }
}