'use client';

import { useState } from 'react';
import { FormData, FormType, Gender } from '@/lib/types';

export default function FormPage() {
  const [tipo, setTipo] = useState<FormType>('entrenador');
  const [formData, setFormData] = useState<FormData>({
    tipo: 'entrenador',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    genero: 'masculino',
    ci: '',
    nivel: '',
    ultimo_curso: '',
    tiempo_experiencia: 0,
    club_entrena: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateField = (name: keyof FormData, value: string | number) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nombres':
      case 'apellido_paterno':
      case 'apellido_materno':
        if (!value || (value as string).trim().length < 2) {
          newErrors[name] = 'Mínimo 2 caracteres';
        } else {
          delete newErrors[name];
        }
        break;
      case 'ci':
        if (!value || (value as string).trim().length < 5) {
          newErrors[name] = 'CI inválido';
        } else {
          delete newErrors[name];
        }
        break;
      case 'nivel':
        if (!value || (value as string).trim().length < 2) {
          newErrors[name] = 'Describe tu nivel';
        } else {
          delete newErrors[name];
        }
        break;
      case 'tiempo_experiencia':
        if (value === undefined || value === null || (value as number) < 0) {
          newErrors[name] = 'Años de experiencia requeridos';
        } else {
          delete newErrors[name];
        }
        break;
      case 'club_entrena':
        if (tipo === 'entrenador' && (!value || (value as string).trim().length < 2)) {
          newErrors[name] = 'Club requerido para entrenadores';
        } else {
          delete newErrors[name];
        }
        break;
      case 'telefono':
        const digits = (value as string).replace(/\D/g, '');
        if (!value || digits.length < 8 || digits.length > 14) {
          newErrors[name] = 'Teléfono: 8-14 dígitos';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        delete newErrors[name];
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'tiempo_experiencia' ? parseInt(value) || 0 : value;
    const newData = { ...formData, [name]: parsedValue };
    setFormData(newData);
    validateField(name as keyof FormData, parsedValue);
  };

  const handleTipoChange = (newTipo: FormType) => {
    setTipo(newTipo);
    setFormData(prev => ({
      ...prev,
      tipo: newTipo,
      club_entrena: newTipo === 'arbitro' ? '' : prev.club_entrena,
    }));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Final validation
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof FormData)[] = [
      'nombres', 'apellido_paterno', 'apellido_materno', 'genero', 'ci', 'nivel', 'tiempo_experiencia', 'telefono'
    ];
    
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value < 0)) {
        newErrors[field as string] = 'Campo requerido';
      }
    });
    
    if (tipo === 'entrenador' && (!formData.club_entrena || formData.club_entrena.trim() === '')) {
      newErrors.club_entrena = 'Club requerido para entrenadores';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          tipo,
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          genero: 'masculino',
          ci: '',
          nivel: '',
          ultimo_curso: '',
          tiempo_experiencia: 0,
          club_entrena: '',
          telefono: '',
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Error al enviar el formulario');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generoOptions: { value: Gender; label: string }[] = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Asociación de Básquetbol Cochabamba</h1>
          <p className="mt-2 text-gray-600">Registro de Entrenadores y Árbitros</p>
        </div>

        {/* Tipo Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTipoChange('entrenador')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                tipo === 'entrenador'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Entrenador
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange('arbitro')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                tipo === 'arbitro'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Árbitro
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6" noValidate>
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              ✓ Formulario enviado correctamente. Gracias por registrarte.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              ✕ {errorMessage}
            </div>
          )}

          {/* Names Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Carlos"
                required
              />
              {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno *</label>
              <input
                type="text"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apellido_paterno ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pérez"
                required
              />
              {errors.apellido_paterno && <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno *</label>
              <input
                type="text"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apellido_materno ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="García"
                required
              />
              {errors.apellido_materno && <p className="mt-1 text-sm text-red-600">{errors.apellido_materno}</p>}
            </div>
          </div>

          {/* Gender, CI, Experience */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {generoOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Carnet CI *</label>
              <input
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ci ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234567"
                required
              />
              {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Años de Experiencia *</label>
              <input
                type="number"
                name="tiempo_experiencia"
                value={formData.tiempo_experiencia}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tiempo_experiencia ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5"
                required
              />
              {errors.tiempo_experiencia && <p className="mt-1 text-sm text-red-600">{errors.tiempo_experiencia}</p>}
            </div>
          </div>

          {/* Level and Last Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de {tipo === 'entrenador' ? 'Entrenador' : 'Árbitro'} *
              </label>
              <textarea
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nivel ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe tu nivel, certificaciones, categorías dirigidas, etc."
                required
              />
              {errors.nivel && <p className="mt-1 text-sm text-red-600">{errors.nivel}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Último Curso Tomado</label>
              <input
                type="text"
                name="ultimo_curso"
                value={formData.ultimo_curso}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Curso FIBA Nivel 1 - 2023"
              />
            </div>
          </div>

          {/* Club (only for trainers) */}
          {tipo === 'entrenador' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Club que Entrena *</label>
              <input
                type="text"
                name="club_entrena"
                value={formData.club_entrena}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.club_entrena ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Club Universitario, Club San Simón, etc."
                required
              />
              {errors.club_entrena && <p className="mt-1 text-sm text-red-600">{errors.club_entrena}</p>}
            </div>
          )}

          {/* Telefono */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 71234567 o 59171234567"
              maxLength={14}
              required
            />
            {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
            <p className="mt-1 text-xs text-gray-500">Solo números, entre 8 y 14 dígitos</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Registro'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            * Campos obligatorios
          </p>
        </form>
      </div>
    </div>
  );
}