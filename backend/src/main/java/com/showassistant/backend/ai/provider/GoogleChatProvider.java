package com.showassistant.backend.ai.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatModel;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * Google Vertex AI Gemini 云端模型提供商
 * 通过 Spring AI VertexAiGeminiChatModel 调用 Google Vertex AI Gemini API 进行流式对话。
 *
 * 通过 application.yml 中 ai.provider=google, ai.mock=false 激活。
 * 需要配置 GCP 项目 ID、区域，以及 Google Application Default Credentials（ADC）。
 * 本地开发：运行 `gcloud auth application-default login` 配置 ADC。
 * Docker/生产：挂载 GCP 服务账号密钥文件并设置 GOOGLE_APPLICATION_CREDENTIALS 环境变量。
 */
@Slf4j
public class GoogleChatProvider implements AiChatProvider {

    private final ChatClient chatClient;

    public GoogleChatProvider(VertexAiGeminiChatModel chatModel) {
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
