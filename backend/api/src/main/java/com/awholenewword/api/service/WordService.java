package com.awholenewword.api.service;

import com.awholenewword.api.dto.WordResponse;
import com.awholenewword.api.entity.Word;
import com.awholenewword.api.exception.ResourceNotFoundException;
import com.awholenewword.api.mapper.WordMapper;
import com.awholenewword.api.repository.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class WordService {

    private final WordRepository wordRepository;
    private final WordMapper wordMapper;

    public WordService(
            WordRepository wordRepository,
            WordMapper wordMapper
    ) {
        this.wordRepository = wordRepository;
        this.wordMapper = wordMapper;
    }

    public WordResponse findByWord(String word) {
        Word result = wordRepository.findByWordIgnoreCase(word)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Word not found: " + word
                        )
                );

        return wordMapper.toResponse(result);
    }

    public WordResponse findRandomWord() {
        Word result = wordRepository.findRandomWord()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No words available"
                        )
                );

        return wordMapper.toResponse(result);
    }
}