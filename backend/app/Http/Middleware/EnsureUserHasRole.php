<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     * Expect roles as comma separated in the parameter, e.g. role:admin or role:admin,organizador
     */
    public function handle(Request $request, Closure $next, $roles = null)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($roles) {
            $allowed = explode(',', $roles);
            if (!in_array($user->tipo, $allowed)) {
                return response()->json(['message' => 'Forbidden. Insufficient role.'], 403);
            }
        }

        return $next($request);
    }
}
