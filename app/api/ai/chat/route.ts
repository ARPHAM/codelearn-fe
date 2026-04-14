import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    try {
        const { messages, codeContext, problemContext } = await req.json();

        const ai = new GoogleGenAI({ apiKey });
        
        // Xây dựng System Prompt
        const systemPrompt = `
Bạn là một trợ lý lập trình thông minh trên nền tảng CodeLearn. 
Nhiệm vụ của bạn là hỗ trợ sinh viên giải quyết các bài tập lập trình một cách sư phạm.

VỀ NGÔN NGỮ:
- Bạn phải trả lời bằng cùng ngôn ngữ mà người dùng đang sử dụng để đặt câu hỏi (Ưu tiên hàng đầu).

VỀ NGỮ CẢNH BÀI TẬP:
- Đề bài: ${JSON.stringify(problemContext?.title)}
- Mô tả: ${JSON.stringify(problemContext?.description)}
- Code hiện tại của sinh viên:
\`\`\`
${codeContext}
\`\`\`

VỀ PHONG CÁCH HỖ TRỢ:
- Đừng bao giờ cung cấp lời giải hoàn chỉnh ngay lập tức trừ khi được yêu cầu rõ ràng.
- Hãy gợi ý, giải thích lỗi, và hướng dẫn từng bước để sinh viên tự tư duy.
- Phân tích lỗi logic hoặc lỗi cú pháp nếu có trong code của họ.
- Nếu sinh viên hỏi ngoài lề không liên quan đến lập trình hoặc bài tập, hãy nhắc nhở họ tập trung vào việc học.
`;

        // Chuyển đổi history sang định dạng Gemini
        // Gemini SDK mới thường nhận contents: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
        const contents = [
            { role: 'user' as const, parts: [{ text: systemPrompt }] },
            { role: 'model' as const, parts: [{ text: "Tôi đã hiểu ngữ cảnh và phong cách hỗ trợ. Tôi đã sẵn sàng trợ giúp bạn!" }] },
            ...messages.map((m: any) => ({
                role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
                parts: [{ text: m.msg || m.content }]
            }))
        ];

        const result = await ai.models.generateContent({
            model: "gemini-flash-latest", // Sử dụng mô hình flash mới nhất
            contents: contents,
        });

        const responseText = result.text; // SDK mới sử dụng thuộc tính .text trực tiếp

        return NextResponse.json({ text: responseText });
    } catch (error: any) {
        console.error('--- AI Chat Error ---', error);
        return NextResponse.json({ 
            error: error.message || 'Error communicating with AI',
            details: error.response?.data || error
        }, { status: 500 });
    }
}
