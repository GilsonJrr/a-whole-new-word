package com.awholenewword.api.service;

import com.awholenewword.api.dto.importdata.WordImportRequest;
import com.awholenewword.api.entity.Example;
import com.awholenewword.api.entity.Word;
import com.awholenewword.api.repository.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WordImportService {

    private final WordRepository wordRepository;

    public WordImportService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @Transactional
    public int importWords(List<WordImportRequest> words) {

        int imported = 0;

        for (WordImportRequest request : words) {

            // Evita importar uma palavra que já existe
            if (wordRepository.findByWordIgnoreCase(request.word()).isPresent()) {
                continue;
            }

            Word word = new Word();

            word.setWord(request.word());
            word.setPhonetic(request.phonetic());
            word.setType(request.type());
            word.setDefinitionPt(request.definition().pt());
            word.setDefinitionEn(request.definition().en());

            for (var exampleRequest : request.examples()) {

                Example example = new Example();

                example.setSentenceEn(exampleRequest.en());
                example.setSentencePt(exampleRequest.pt());

                word.addExample(example);
            }

            wordRepository.save(word);

            imported++;
        }

        return imported;
    }
}