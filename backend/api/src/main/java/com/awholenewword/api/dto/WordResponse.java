
package com.awholenewword.api.dto;

import java.util.List;

public record WordResponse(
        String word,
        String language,
        String phonetic,
        String type,
        DefinitionResponse definition,
        List<ExampleResponse> examples
) {
}
