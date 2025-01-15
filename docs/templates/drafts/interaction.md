# Fluxo de Processamento de Conteúdo

Este fluxo detalha passo a passo como o sistema processa o conteúdo desde o upload de um vídeo pelo usuário até a geração de áudios, transcrições e traduções, seguindo a arquitetura modular e orquestrada definida anteriormente.

## **Diagrama de Sequência:**

```plantuml
@startuml SystemsInteractions
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Sequence.puml

title Sequence Diagram of Content Processing Workflow

Person(user, "User", "User of the system")
Container(contentPlatform, "Content Platform", "Web/Mobile", "Plataforma de gerenciamento de conteúdo")

ContainerDb(bucketVideo, "Bucket de Vídeos", "S3/Blob Storage")
ContainerDb(bucketAudio, "Bucket de Áudios", "S3/Blob Storage")
ContainerDb(bucketTrans, "Bucket de Transcrições", "S3/Blob Storage")
ContainerDb(bucketTransl, "Bucket de Traduções", "S3/Blob Storage")

Container(storagePublisher, "Storage Publisher", "Service", "Publica eventos de armazenamento")
Container(contentStorageWatcher, "Content Storage Watcher", "Service", "Orquestra e despacha tarefas")
Container(orchestrator, "Orchestrator", "Service", "Gerencia o fluxo de trabalho")

Container(audioExtractor, "Audio Extractor", "Service", "Extrai áudio de vídeos")
Container(STT, "Speech-to-Text Service", "Service", "Transcreve áudio em texto")
Container(translate, "Translation Service", "Service", "Traduz texto")
Container(TTS, "Text-to-Speech Service", "Service", "Converte texto em áudio")

ContainerQueue(contentStorageTopic, "Content Storage Topic", "Queue", "RabbitMQ/Kafka/SQS")
ContainerQueue(audioExtractionJobTopic, "Audio Extraction Job Topic", "Queue", "RabbitMQ/Kafka/SQS")
ContainerQueue(audioTranscriptionJobTopic, "Audio Transcription Job Topic", "Queue", "RabbitMQ/Kafka/SQS")
ContainerQueue(textTranslationJobTopic, "Text Translation Job Topic", "Queue", "RabbitMQ/Kafka/SQS")
ContainerQueue(textToSpeechJobTopic, "Text-to-Speech Job Topic", "Queue", "RabbitMQ/Kafka/SQS")

' Sequence of interactions
user -> contentPlatform : Uploads Video
contentPlatform -> bucketVideo : Stores Video
bucketVideo -> storagePublisher : Triggers Storage Event
storagePublisher -> contentStorageTopic : Publishes Storage Event
contentStorageTopic -> orchestrator : Receives Storage Event
orchestrator -> contentStorageWatcher : Defines Workflow
contentStorageWatcher -> audioExtractionJobTopic : Sends Audio Extraction Request
audioExtractionJobTopic -> audioExtractor : Processes Audio Extraction
audioExtractor -> bucketAudio : Stores Extracted Audio
audioExtractor -> audioTranscriptionJobTopic : Sends Transcription Request
audioTranscriptionJobTopic -> STT : Processes Transcription
STT -> bucketTrans : Stores Transcription
STT -> textTranslationJobTopic : Sends Translation Request
textTranslationJobTopic -> translate : Processes Translation
translate -> bucketTransl : Stores Translation
translate -> textToSpeechJobTopic : Sends TTS Request
textToSpeechJobTopic -> TTS : Processes Text-to-Speech
TTS -> bucketAudio : Stores Generated Audio

@enduml
```

## **Passo a Passo do Fluxo:**

1. **Upload do Vídeo:**
   - **Usuário**:
     - O usuário faz o upload de um vídeo através da **Plataforma de Conteúdo**.
   - **Content Platform**:
     - Recebe o vídeo e o armazena no **Bucket de Vídeos**.

2. **Notificação de Armazenamento:**
   - **Bucket de Vídeos**:
     - Ao armazenar um novo vídeo, envia uma notificação para o **Storage Publisher**.
   - **Storage Publisher**:
     - Recebe a notificação e publica um evento no **Tópico de Armazenamento de Conteúdo**.

3. **Orquestração do Workflow:**
   - **Orchestrator**:
     - Escuta eventos no **Content Storage Topic**.
     - Ao receber o evento, analisa os metadados do vídeo para determinar o fluxo de trabalho necessário.
     - Decide quais serviços serão acionados (por exemplo, extração de áudio, transcrição, tradução, TTS).

4. **Definição e Início do Fluxo de Trabalho:**
   - **Content Storage Watcher**:
     - Recebe as instruções do **Orchestrator** sobre o fluxo de trabalho definido.
     - Envia solicitações para as filas de tarefas apropriadas:
       - **Tópico de Extração de Áudio**
       - **Tópico de Transcrição de Áudio**
       - **Tópico de Tradução de Texto**
       - **Tópico de Texto para Fala**

5. **Extração de Áudio:**
   - **Audio Extraction Job Topic**:
     - Recebe a solicitação para extrair áudio do vídeo.
   - **Audio Extractor**:
     - Consome a mensagem e extrai o áudio do vídeo armazenado no **Bucket de Vídeos**.
     - Armazena o áudio extraído no **Bucket de Áudios**.
     - Opcionalmente, pode enviar uma notificação de conclusão.

6. **Transcrição do Áudio:**
   - **Audio Transcription Job Topic**:
     - Recebe a solicitação para transcrever o áudio.
   - **STT (Serviço de Transcrição de Áudio)**:
     - Consome a mensagem e transcreve o áudio armazenado no **Bucket de Áudios**.
     - Armazena o texto transcrito no **Bucket de Transcrições**.
     - Verifica se é necessária a tradução do texto.

7. **Tradução do Texto:**
   - **STT**:
     - Se necessário, envia uma solicitação para o **Tópico de Tradução de Texto**.
   - **Text Translation Job Topic**:
     - Recebe a solicitação de tradução.
   - **Translate (Serviço de Tradução de Texto)**:
     - Consome a mensagem e traduz o texto do **Bucket de Transcrições**.
     - Armazena o texto traduzido no **Bucket de Traduções**.
     - Decide se o texto traduzido deve ser convertido em áudio.

8. **Conversão de Texto em Áudio (TTS):**
   - **Translate**:
     - Se configurado, envia uma solicitação para o **Tópico de Texto para Fala**.
   - **Text to Speech Job Topic**:
     - Recebe a solicitação de TTS.
   - **TTS (Serviço de Geração de Áudio)**:
     - Consome a mensagem e converte o texto em áudio.
     - Armazena o áudio gerado no **Bucket de Áudios**.

9. **Atualização do Conteúdo na Plataforma:**
   - **Content Platform**:
     - Monitora os buckets para atualizações.
     - Disponibiliza ao usuário os novos conteúdos:
       - Áudio extraído
       - Transcrição do áudio
       - Tradução do texto
       - Áudio gerado a partir do texto traduzido

## **Detalhes Específicos do Fluxo:**

- **Decisões Baseadas em Metadados:**
  - O **Orchestrator** utiliza metadados para decidir quais etapas são necessárias.
  - Por exemplo, se o áudio original já está em um idioma alvo, a tradução pode ser ignorada.

- **Paralelização Inteligente:**
  - Tarefas independentes podem ser executadas em paralelo.
  - A extração de áudio e a transcrição podem ocorrer simultaneamente se não houver dependência direta.

- **Modularidade dos Serviços:**
  - Cada serviço (Extração de Áudio, STT, Tradução, TTS) é independente.
  - Isso permite escalabilidade e manutenção isolada de cada componente.

- **Uso de Filas de Mensagens:**
  - Filas como o **Audio Extraction Job Topic** desacoplam produtores e consumidores.
  - Melhoram a resiliência e permitem retries em caso de falhas.

## **Interações Entre Componentes:**

1. **Usuário e Content Platform:**
   - O usuário interage diretamente com a plataforma para upload e acesso ao conteúdo.

2. **Content Platform e Buckets:**
   - A plataforma armazena e recupera conteúdos dos buckets correspondentes.

3. **Buckets e Storage Publisher:**
   - Os buckets notificam o **Storage Publisher** sobre novos conteúdos.

4. **Storage Publisher e Content Storage Topic:**
   - Publica eventos de armazenamento na fila para processamento posterior.

5. **Orchestrator e Content Storage Topic:**
   - O **Orchestrator** escuta a fila e inicia o fluxo de trabalho adequado.

6. **Content Storage Watcher e Filas de Tarefas:**
   - Envia solicitações específicas para cada serviço através das filas.

7. **Serviços Específicos e Buckets:**
   - Cada serviço processa sua tarefa e armazena o resultado no bucket correspondente.

8. **Content Platform e Usuário (Retorno):**
   - Após o processamento, a plataforma disponibiliza os resultados ao usuário.

## **Benefícios do Fluxo Descrito:**

- **Eficiência Operacional:**
  - A orquestração inteligente evita processamento desnecessário.
  - A paralelização reduz o tempo total de processamento.

- **Flexibilidade e Escalabilidade:**
  - Serviços desacoplados permitem escalonamento horizontal conforme a demanda.
  - Novas funcionalidades podem ser adicionadas sem impactar o sistema existente.

- **Experiência do Usuário:**
  - O usuário recebe conteúdos adicionais (transcrições, traduções, áudios) que enriquecem a interação com a plataforma.

- **Resiliência e Tolerância a Falhas:**
  - O uso de filas e serviços independentes permite isolamento de falhas.
  - Em caso de erro em uma etapa, o sistema pode reprocessar apenas aquela parte.

## **Cenários Especiais:**

- **Conteúdos em Múltiplos Idiomas:**
  - O sistema pode identificar o idioma do conteúdo e ajustar o fluxo de trabalho.
  - Se o conteúdo já estiver no idioma desejado, etapas como tradução podem ser ignoradas.

- **Preferências do Usuário:**
  - Usuários podem configurar preferências que influenciam o fluxo.
  - Por exemplo, optar por não gerar áudio a partir de texto ou escolher idiomas específicos para tradução.

- **Integração com Serviços Externos:**
  - Serviços como STT e TTS podem ser integrados a provedores externos especializados.
  - Isso permite utilizar tecnologias de ponta sem desenvolver soluções internas complexas.
