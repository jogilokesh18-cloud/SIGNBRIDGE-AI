/**
 * AURA AI — Generative Virtual Try-On Service
 *
 * Uses Gemini's native image generation (responseModalities: IMAGE)
 * to photorealistically edit a person's photo so they appear to be
 * genuinely wearing the uploaded garment — not a cut-and-paste overlay,
 * but a full re-render of the clothing region of the photo.
 */
import { geminiClient } from '../config/gemini.js';
import { logger } from '../config/logger.js';

export interface TryonRequest {
  /** Base64-encoded person photo (JPEG or PNG). */
  personImageBase64: string;
  /** MIME type of the person photo. */
  personImageMimeType: string;
  /** Base64-encoded garment / product photo. */
  garmentImageBase64: string;
  /** MIME type of the garment photo. */
  garmentImageMimeType: string;
  /** Optional garment name for the prompt. */
  garmentName?: string;
  /** Optional garment description. */
  garmentDescription?: string;
}

export interface TryonResult {
  /** Base64-encoded result image where the person is wearing the garment. */
  resultImageBase64: string;
  /** MIME type of the result image. */
  resultMimeType: string;
  /** Text description / styling notes from the AI. */
  stylingNotes: string;
}

export class TryonService {
  /**
   * Takes a person photo + garment photo and uses Gemini to generate
   * an edited photo where the person is naturally wearing the garment.
   */
  async generateTryon(request: TryonRequest): Promise<TryonResult> {
    if (!geminiClient) {
      throw new Error(
        'Gemini API is not configured. Please set GEMINI_API_KEY in your .env file.'
      );
    }

    const garmentLabel = request.garmentName || 'the garment';
    const garmentDesc = request.garmentDescription
      ? ` Description: ${request.garmentDescription}.`
      : '';

    // Carefully crafted prompt: edit the person photo to show them wearing
    // the exact garment from the second image. NOT a paste or overlay —
    // the AI must re-render/edit the torso region of the person photo.
    const editPrompt = `You are a professional fashion photo editor. I am providing two images:

IMAGE 1 (Person Photo): A photo of a person.
IMAGE 2 (Garment/Product Photo): A photo of a clothing item called "${garmentLabel}".${garmentDesc}

YOUR TASK: Edit the person's photo (Image 1) so that the person appears to be NATURALLY WEARING the clothing item from Image 2. This must look like a real photograph — the garment must conform to the person's body shape, follow their posture and proportions, have realistic fabric draping, proper lighting that matches the scene, natural shadows and wrinkles in the fabric, and the person's skin/face/hair must remain completely unchanged. Do NOT paste or overlay the garment — REDRAW the person's torso/body region to show them wearing this specific garment in a photorealistic way. The result should look like the person actually put on this clothing and someone took a new photo of them.

Output ONLY the edited person photo, nothing else.`;

    logger.info(
      { garmentName: garmentLabel },
      'Sending virtual try-on request to Gemini image generation'
    );

    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: [
          {
            role: 'user',
            parts: [
              { text: editPrompt },
              {
                inlineData: {
                  data: request.personImageBase64,
                  mimeType: request.personImageMimeType
                }
              },
              {
                inlineData: {
                  data: request.garmentImageBase64,
                  mimeType: request.garmentImageMimeType
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.4
        }
      });

      // Extract image and text parts from the response
      let resultImageBase64 = '';
      let resultMimeType = 'image/png';
      let stylingNotes = '';

      const candidates = response?.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              resultImageBase64 = part.inlineData.data;
              resultMimeType = part.inlineData.mimeType || 'image/png';
            }
            if (part.text) {
              stylingNotes += part.text;
            }
          }
        }
      }

      if (!resultImageBase64) {
        // Fallback: check if response has a text property with image data
        const text = response?.text;
        if (text) {
          stylingNotes = text;
        }
        throw new Error(
          'Gemini did not return an image. The model may not support image generation, or the request was filtered. ' +
            (stylingNotes ? `Model said: ${stylingNotes}` : '')
        );
      }

      logger.info('Virtual try-on image generated successfully by Gemini');

      return {
        resultImageBase64,
        resultMimeType,
        stylingNotes:
          stylingNotes ||
          `${garmentLabel} has been naturally fitted to the person's body with realistic draping and lighting.`
      };
    } catch (err: any) {
      logger.error({ err }, 'Gemini virtual try-on generation failed');
      throw err;
    }
  }
}

export const tryonService = new TryonService();
