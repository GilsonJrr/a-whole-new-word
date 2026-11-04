package com.awholenewword.api.dto.importdata;

import java.util.List;

public record WordImportRequest(
        String word,
        String language,
        String phonetic,
        String type,
        DefinitionImportRequest definition,
        List<ExampleImportRequest> examples
) {
}