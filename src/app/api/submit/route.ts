import { NextRequest, NextResponse } from 'next/server';
import { submitForm, initializeDatabase } from '@/lib/db';
import { FormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const body: FormData = await request.json();
    
    // Validate required fields
    const requiredFields: (keyof FormData)[] = [
      'tipo', 'nombres', 'apellido_paterno', 'apellido_materno', 
      'genero', 'ci', 'nivel', 'tiempo_experiencia', 'telefono'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Campo requerido faltante: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate tipo
    if (!['entrenador', 'arbitro'].includes(body.tipo)) {
      return NextResponse.json(
        { success: false, error: 'Tipo debe ser "entrenador" o "arbitro"' },
        { status: 400 }
      );
    }
    
    // Validate genero
    if (!['masculino', 'femenino', 'otro'].includes(body.genero)) {
      return NextResponse.json(
        { success: false, error: 'Género inválido' },
        { status: 400 }
      );
    }
    
    // For trainers, club is required
    if (body.tipo === 'entrenador' && !body.club_entrena) {
      return NextResponse.json(
        { success: false, error: 'El club es requerido para entrenadores' },
        { status: 400 }
      );
    }

    // Validate telefono: only digits, min 8, max 14
    const telefonoDigits = body.telefono.replace(/\D/g, '');
    if (telefonoDigits.length < 8 || telefonoDigits.length > 14) {
      return NextResponse.json(
        { success: false, error: 'Teléfono debe tener entre 8 y 14 dígitos' },
        { status: 400 }
      );
    }
    
    const result = await submitForm(body);
    
    return NextResponse.json({
      success: true,
      message: 'Formulario enviado correctamente',
      data: { id: (result as { insertId: number }).insertId }
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}