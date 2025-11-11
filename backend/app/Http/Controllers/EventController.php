<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $events = Event::with(['promoter'])->whereNull('deleted_at')->get();
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao carregar eventos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'location' => 'required|string',
            'type' => 'required|string|in:academico,cultural,desportivo',
            'category' => 'required|string',
            'max_participants' => 'required|integer|min:1',
            'promoter_id' => 'required|exists:users,id',
            'status' => 'sometimes|string|in:pendente,aprovado,rejeitado,cancelado,finalizado',
            'image' => 'nullable|string', // Aproximadamente 10MB em base64
            'requirements' => 'nullable|string',
            'target_audience' => 'required|string'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            // Define status padrão como 'pendente' se não fornecido
            $eventData = $request->all();
            if (!isset($eventData['status'])) {
                $eventData['status'] = 'pendente';
            }
            
            $event = Event::create($eventData);
            return response()->json($event->load('promoter'), 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar evento: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erro ao criar evento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $event = Event::with(['promoter'])->whereNull('deleted_at')->find($id);
            
            if (!$event) {
                return response()->json(['error' => 'Evento não encontrado'], 404);
            }

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao carregar evento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
 

public function update(Request $request, $id)
{
    $event = Event::whereNull('deleted_at')->find($id);
    
    if (!$event) {
        return response()->json(['error' => 'Evento não encontrado'], 404);
    }

    $validator = Validator::make($request->all(), [
        'title' => 'sometimes|required|string|max:255',
        'description' => 'sometimes|required|string',
        'date' => 'sometimes|required|date',
        'time' => 'sometimes|required|string',
        'location' => 'sometimes|required|string',
        'type' => 'sometimes|required|string|in:academico,cultural,desportivo',
        'category' => 'sometimes|required|string',
        'max_participants' => 'sometimes|required|integer|min:1',
        'status' => 'sometimes|required|in:pendente,aprovado,rejeitado,cancelado,finalizado',
        'image' => 'nullable|string', // REMOVA O LIMITE MAX
        'requirements' => 'nullable|string',
        'target_audience' => 'sometimes|required|string',
        'deleted_at' => 'nullable|date'
    ]);

    if ($validator->fails()) {
        \Log::error('Validação falhou:', $validator->errors()->toArray());
        return response()->json(['errors' => $validator->errors()], 422);
    }

    try {
        $data = $request->all();
        
        // Log para debug
        \Log::info('Atualizando evento ID: ' . $id, [
            'title' => $data['title'] ?? '',
            'date' => $data['date'] ?? '',
            'has_image' => isset($data['image']) ? 'Sim' : 'Não',
            'image_length' => isset($data['image']) ? strlen($data['image']) : 0
        ]);
        
        $event->update($data);
        
        \Log::info('Evento atualizado com sucesso ID: ' . $id);
        return response()->json($event->load('promoter'));
    } catch (\Exception $e) {
        \Log::error('Erro ao atualizar evento ID ' . $id . ': ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json([
            'error' => 'Erro ao atualizar evento: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $event = Event::find($id);
            
            if (!$event) {
                return response()->json(['error' => 'Evento não encontrado'], 404);
            }

            $event->delete(); // Soft delete
            return response()->json(['message' => 'Evento arquivado com sucesso'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao arquivar evento: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para restaurar evento
    public function restore($id)
    {
        try {
            $event = Event::withTrashed()->find($id);
            
            if (!$event) {
                return response()->json(['error' => 'Evento não encontrado'], 404);
            }

            $event->restore();
            return response()->json(['message' => 'Evento restaurado com sucesso', 'event' => $event->load('promoter')]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao restaurar evento: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para obter eventos arquivados
    public function archived()
    {
        try {
            $events = Event::onlyTrashed()->with(['promoter'])->get();
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao carregar eventos arquivados: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para obter eventos por tipo
    public function getByType($type)
    {
        try {
            $validTypes = ['academico', 'cultural', 'desportivo'];
            
            if (!in_array($type, $validTypes)) {
                return response()->json(['error' => 'Tipo de evento inválido'], 422);
            }

            $events = Event::where('type', $type)
                          ->whereNull('deleted_at')
                          ->with(['promoter'])
                          ->get();
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao carregar eventos por tipo: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para obter eventos por status
    public function getByStatus($status)
    {
        try {
            $validStatuses = ['pendente', 'aprovado', 'rejeitado', 'cancelado', 'finalizado'];
            
            if (!in_array($status, $validStatuses)) {
                return response()->json(['error' => 'Status de evento inválido'], 422);
            }

            $events = Event::where('status', $status)
                          ->whereNull('deleted_at')
                          ->with(['promoter'])
                          ->get();
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao carregar eventos por status: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para aprovar/rejeitar evento (admin)
    public function updateStatus(Request $request, $id)
    {
        $event = Event::whereNull('deleted_at')->find($id);
        
        if (!$event) {
            return response()->json(['error' => 'Evento não encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:aprovado,rejeitado',
            'feedback' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $event->status = $request->status;
            if ($request->has('feedback')) {
                $event->feedback = $request->feedback;
            }
            $event->save();

            return response()->json($event->load('promoter'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao atualizar status do evento: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para buscar eventos
    public function search(Request $request)
    {
        try {
            $query = Event::query()->with(['promoter'])->whereNull('deleted_at');

            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%")
                      ->orWhere('location', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->has('type') && $request->type) {
                $query->where('type', $request->type);
            }

            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('date') && $request->date) {
                $query->whereDate('date', $request->date);
            }

            $events = $query->get();
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao buscar eventos: ' . $e->getMessage()
            ], 500);
        }
    }
}