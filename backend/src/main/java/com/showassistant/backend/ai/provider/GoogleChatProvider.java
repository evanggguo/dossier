package com.showassistant.backend.ai.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * Google AI Studio（Gemini）云端模型提供商
 * 通过 Spring AI GoogleGenAiChatModel 调用 Google AI Studio API 进行流式对话。
 *
 * 通过 application.yml 中 ai.provider=google, ai.mock=false 激活。
 * 需要在环境变量中设置 GOOGLE_AI_API_KEY（Google AI Studio 的 API Key）。
 */
@Slf4j
public class GoogleChatProvider implements AiChatProvider {

    private final ChatClient chatClient;

    public GoogleChatProvider(GoogleGenAiChatModel chatModel) {
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    @Override
    public Flux<String> streamChat(List<Message> messages, Object... tools) {
        log.debug("[GoogleChatProvider] streamChat called with {} messages", messages.size());
        return chatClient.prompt()
            .messages(messages)
            .tools(tools)
            .stream()
            .content();
    }

    @Override
    public String providerName() {
        return "google";
    }
}
