package com.awholenewword.api.service;

import com.awholenewword.api.dto.importdata.WordImportRequest;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WordDataLoader implements ApplicationRunner {

    private final ObjectMapper objectMapper;
    private final WordImportService wordImportService;
    private final Resource wordsFile;

    public WordDataLoader(
            ObjectMapper objectMapper,
            WordImportService wordImportService,
            @Value("classpath:data/words.json") Resource wordsFile
    ) {
        this.objectMapper = objectMapper;
        this.wordImportService = wordImportService;
        this.wordsFile = wordsFile;
    }

    @Override
    public void run(org.springframework.boot.ApplicationArguments args) throws Exception {

        System.out.println("=================================");
        System.out.println("INICIANDO IMPORTAÇÃO DE PALAVRAS");
        System.out.println("=================================");

        System.out.println("Arquivo encontrado: " + wordsFile.exists());

        List<WordImportRequest> words;

        try (var inputStream = wordsFile.getInputStream()) {
            words = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<WordImportRequest>>() {}
            );
        }

        System.out.println("Palavras encontradas no JSON: " + words.size());

        int imported = wordImportService.importWords(words);

        System.out.println("Palavras importadas: " + imported);
        System.out.println("=================================");
    }
}