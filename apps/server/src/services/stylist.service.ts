import { geminiClient } from '../config/gemini.js';
import { dbRepository } from '../repositories/db.repository.js';
import { GarmentItem, StylistMessage, BodyAnalysisResult, AestheticVibe } from '@signbridge/shared-types';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

export class AuraStylistService {
  async consult(params: {
    user_prompt: string;
    conversation_history?: Array<{ role: 'user' | 'stylist'; content: string }>;
    body_analysis?: Partial<BodyAnalysisResult>;
    current_vibe?: AestheticVibe;
    active_tryon_id?: string;
  }): Promise<StylistMessage> {
    const catalog = await dbRepository.getGarments();
    const activeGarment = params.active_tryon_id
      ? await dbRepository.getGarmentById(params.active_tryon_id)
      : null;

    let responseText = '';
    let recommended: GarmentItem[] = [];

    // Filter potential recommendations based on vibe or prompt keyword
    const promptLower = params.user_prompt.toLowerCase();
    if (promptLower.includes('formal') || promptLower.includes('tuxedo') || promptLower.includes('black tie') || promptLower.includes('gala')) {
      recommended = catalog.filter((g) => g.aesthetic_vibe === 'black_tie' || g.category === 'formalwear');
    } else if (promptLower.includes('coat') || promptLower.includes('warm') || promptLower.includes('cashmere') || promptLower.includes('winter')) {
      recommended = catalog.filter((g) => g.category === 'outerwear');
    } else if (promptLower.includes('emerald') || promptLower.includes('silk') || promptLower.includes('dinner')) {
      recommended = catalog.filter((g) => g.aesthetic_vibe === 'quiet_luxury' || g.color_hex === '#064e3b');
    } else {
      recommended = catalog.slice(0, 3);
    }

    if (recommended.length === 0) {
      recommended = catalog.slice(0, 2);
    }

    // Try Google Gemini if configured
    if (geminiClient) {
      try {
        const systemPrompt = `You are AURA, an elite private Milanese fashion stylist and luxury concierge.
You provide advice with effortless elegance, poetic precision, and deep sartorial knowledge.
Never sound like a generic robotic customer support bot.
Speak with warmth, charisma, and discerning taste.
The customer's measurements: Estimated Size: ${params.body_analysis?.estimated_size || 'M'}, Skin Undertone: ${params.body_analysis?.skin_undertone || 'Neutral Olive'}, Silhouette: ${params.body_analysis?.silhouette || 'Architectural'}.
Keep your reply to 2-3 evocative sentences, addressing their specific occasion or visual aesthetic.`;

        const response = await geminiClient.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nCustomer says: "${params.user_prompt}"` }]
            }
          ]
        });

        responseText = response.text || '';
      } catch (err) {
        logger.warn({ err }, 'Gemini API call skipped, using deterministic luxury concierge engine');
      }
    }

    // High-end deterministic persona fallback if Gemini not active
    if (!responseText) {
      const topPick = recommended[0];
      const toneMap: Record<string, string> = {
        black_tie: `For an occasion of that magnitude, we need a silhouette that commands the room without whispering a word. I have draped the ${topPick.name} over your live silhouette—notice how the peaked silk lapel catches the ambient light and broadens the shoulder line.`,
        quiet_luxury: `True luxury is never loud. The ${topPick.name} in double-faced Italian silk is cut with effortless nonchalance. Given your ${params.body_analysis?.skin_undertone || 'neutral'} undertones, the rich jewel undertones give you an undeniable natural radiance.`,
        cyber_tailored: `Sharply sculpted and uncompromising. The ${topPick.name} blends technical performance with elevated modern tailoring. Notice the structural contour along your chest-to-waist ratio.`,
        default: `A brilliant instinct. I have curated the ${topPick.name} specifically for your proportions. The drape falls effortlessly, creating clean vertical geometry that flatters your silhouette in every lighting condition.`
      };

      responseText = toneMap[topPick?.aesthetic_vibe || 'default'] || toneMap.default;
    }

    return {
      id: `msg-${crypto.randomBytes(3).toString('hex')}`,
      sender: 'stylist',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommended_garments: recommended,
      suggested_prompts: [
        'How does the shoulder fit look on me?',
        'Can I see this in a deeper emerald tone?',
        'Show me outerwear to layer over this',
        'Reserve this piece in my verified size'
      ],
      active_tryon_id: recommended[0]?.id
    };
  }
}

export const stylistService = new AuraStylistService();
