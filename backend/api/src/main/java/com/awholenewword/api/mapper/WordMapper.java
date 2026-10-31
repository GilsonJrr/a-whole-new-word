
package com.awholenewword.api.mapper;

import com.awholenewword.api.dto.DefinitionResponse;
import com.awholenewword.api.dto.ExampleResponse;
import com.awholenewword.api.dto.WordResponse;
import com.awholenewword.api.entity.Word;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WordMapper {

    public WordResponse toResponse(Word word) {

        DefinitionResponse definition = new DefinitionResponse(
                word.getDefinitionPt(),
                word.getDefinitionEn()
        );

        List<ExampleResponse> examples = word.getExamples()
                .stream()
                .map(example -> new ExampleResponse(
                        example.getSentenceEn(),
                        example.getSentencePt()
                ))
                .toList();

        return new WordResponse(
                word.getWord(),
                word.getPhonetic(),
                word.getType(),
                definition,
                examples
        );
    }
}
