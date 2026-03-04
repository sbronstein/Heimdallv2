export function notFound(entity: string) {
  return Response.json(
    { success: false, error: `${entity} not found` },
    { status: 404 }
  );
}

export function validationError(message: string) {
  return Response.json(
    { success: false, error: message },
    { status: 400 }
  );
}

export function serverError(error: unknown) {
  console.error('API Error:', error);
  return Response.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
