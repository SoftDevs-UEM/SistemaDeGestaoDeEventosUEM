<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with(['promoter'])->get();
        return response()->json($events);
    }

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
        'image' => 'nullable|string',
        'requirements' => 'nullable|string',
        'target_audience' => 'required|string'
        // Remova 'status' da validação - será definido automaticamente
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->fails()], 422);
    }

    $data = $request->all();
    $data['status'] = 'pendente'; // Status padrão

    $event = Event::create($data);
    return response()->json($event->load('promoter'), 201);
}

    public function show(Event $event)
    {
        return response()->json($event->load('promoter'));
    }

    public function update(Request $request, Event $event)
    {
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
            'image' => 'nullable|string',
            'requirements' => 'nullable|string',
            'target_audience' => 'sometimes|required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $event->update($request->all());
        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(null, 204);
    }

    // Método para obter eventos por tipo
    public function getByType($type)
    {
        $events = Event::where('type', $type)
                      ->with(['promoter'])
                      ->get();
        return response()->json($events);
    }

    // Método para obter eventos por status
    public function getByStatus($status)
    {
        $events = Event::where('status', $status)
                      ->with(['promoter'])
                      ->get();
        return response()->json($events);
    }

    // Método para aprovar/rejeitar evento (admin)
    public function updateStatus(Request $request, Event $event)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:aprovado,rejeitado',
            'feedback' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $event->status = $request->status;
        if ($request->has('feedback')) {
            $event->feedback = $request->feedback;
        }
        $event->save();

        return response()->json($event);
    }

    // Método para buscar eventos
    public function search(Request $request)
    {
        $query = Event::query()->with(['promoter']);

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('location', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        $events = $query->get();
        return response()->json($events);
    }
}