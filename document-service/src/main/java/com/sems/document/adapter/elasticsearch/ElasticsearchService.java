package com.sems.document.adapter.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.sems.document.domain.model.Document;
import com.sems.document.domain.port.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElasticsearchService implements SearchService {

    private final ElasticsearchClient elasticsearchClient;

    @Value("${app.elasticsearch.index-name}")
    private String indexName;

    @Override
    public void indexDocument(Document document) {
        try {
            IndexRequest<Document> indexRequest = IndexRequest.of(i -> i
                    .index(indexName)
                    .id(document.getId().toString())
                    .document(document));

            IndexResponse response = elasticsearchClient.index(indexRequest);
            log.info("Document indexed successfully: {}, result: {}", document.getId(), response.result().name());
        } catch (IOException e) {
            log.error("Error indexing document in Elasticsearch", e);
            throw new RuntimeException("Error indexing document in Elasticsearch", e);
        }
    }

    @Override
    public void updateDocument(Document document) {
        indexDocument(document); // Same operation in Elasticsearch
    }

    @Override
    public void deleteDocument(UUID id) {
        try {
            elasticsearchClient.delete(d -> d
                    .index(indexName)
                    .id(id.toString()));
            log.info("Document deleted successfully: {}", id);
        } catch (IOException e) {
            log.error("Error deleting document from Elasticsearch", e);
            throw new RuntimeException("Error deleting document from Elasticsearch", e);
        }
    }

    @Override
    public List<Document> search(String query) {
        try {
            Query searchQuery = Query.of(q -> q
                    .multiMatch(m -> m
                            .query(query)
                            .fields("fileName", "description", "tags", "contentType")));

            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(indexName)
                    .query(searchQuery));

            SearchResponse<Document> response = elasticsearchClient.search(searchRequest, Document.class);

            return response.hits().hits().stream()
                    .map(hit -> hit.source())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Error searching documents in Elasticsearch", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Document> findByTags(List<String> tags) {
        try {
            // Create a terms query for tags
            List<FieldValue> fieldValues = tags.stream()
                    .map(tag -> FieldValue.of(tag))
                    .collect(Collectors.toList());
                    
            Query searchQuery = Query.of(q -> q
                    .terms(t -> t
                            .field("tags")
                            .terms(tt -> tt
                                    .value(fieldValues))));

            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(indexName)
                    .query(searchQuery));

            SearchResponse<Document> response = elasticsearchClient.search(searchRequest, Document.class);

            return response.hits().hits().stream()
                    .map(hit -> hit.source())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Error finding documents by tags in Elasticsearch", e);
            return new ArrayList<>();
        }
    }
} 