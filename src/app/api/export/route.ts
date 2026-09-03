import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, initializeDatabase } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const submissions = await getAllSubmissions();
    
    // Transform data for Excel export
    const exportData = (submissions as Submission[]).map((s, index) => ({
      '#': index + 1,
      'Tipo': s.tipo === 'entrenador' ? 'Entrenador' : 'Árbitro',
      'Nombres': s.nombres,
      'Apellido Paterno': s.apellido_paterno,
      'Apellido Materno': s.apellido_materno,
      'Género': s.genero === 'masculino' ? 'Masculino' : s.genero === 'femenino' ? 'Femenino' : 'Otro',
      'CI': s.ci,
      'Nivel': s.nivel,
      'Último Curso': s.ultimo_curso || '',
      'Años de Experiencia': s.tiempo_experiencia,
      'Club (Entrenadores)': s.club_entrena || '',
      'Teléfono': s.telefono,
      'Fecha de Registro': new Date(s.created_at).toLocaleDateString('es-BO'),
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 5 },   // #
      { wch: 15 },  // Tipo
      { wch: 20 },  // Nombres
      { wch: 20 },  // Apellido Paterno
      { wch: 20 },  // Apellido Materno
      { wch: 15 },  // Género
      { wch: 15 },  // CI
      { wch: 25 },  // Nivel
      { wch: 30 },  // Último Curso
      { wch: 18 },  // Años de Experiencia
      { wch: 25 },  // Club
      { wch: 18 },  // Teléfono
      { wch: 18 },  // Fecha de Registro
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="registros_basketbol_cochabamba_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar el archivo Excel' },
      { status: 500 }
    );
  }
}

interface Submission {
  id: number;
  tipo: 'entrenador' | 'arbitro';
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: 'masculino' | 'femenino' | 'otro';
  ci: string;
  nivel: string;
  ultimo_curso: string | null;
  tiempo_experiencia: number;
  club_entrena: string | null;
  telefono: string;
  created_at: string;
  updated_at: string;
}