# Arquitetura Agrupada por Funcionalidade com Orquestração de Workflows, Modularidade e Paralelização Inteligente

Esta arquitetura descreve um sistema de gerenciamento de conteúdo que integra múltiplos serviços para processar vídeos, extrair áudios, transcrever, traduzir e gerar áudio a partir de texto. O sistema é projetado para ser modular, permitindo orquestração dinâmica de workflows e paralelização inteligente de tarefas.

## **Diagrama de Componentes:**

```plantuml
@startuml SystemsContainer
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title Arquitetura de Sistema - Processamento com Filas Singulares, Storage e Produtor de Mensagens

Container(contentPlatform, "Content Platform", "Web/Mobile", "Plataforma de gerenciamento de conteúdo")

Container(bucketVideo, "Bucket de Videos", "S3/Blob Storage")
Container(bucketAudio, "Bucket de Áudios", "S3/Blob Storage")
Container(bucketTrans, "Bucket de Transcrições", "S3/Blob Storage")
Container(bucketTransl, "Bucket de Traduções", "S3/Blob Storage")

Container(storagePublisher, "Storage Publisher", "Service", "Publica eventos de armazenamento")
Container(contentStorageWatcher, "Observador de Armazenamento", "Serviço", "Orquestra e despacha tarefas")
Container(orchestrator, "Orquestrador de Workflows", "Serviço", "Gerencia o fluxo de trabalho de forma dinâmica e condicional")

Container(audioExtractor, "Serviço de Extração de Áudio", "Serviço", "Extrai áudio de vídeos")
Container(STT, "Serviço de Transcrição de Áudio", "Serviço", "Transcreve áudio em texto")
Container(translate, "Serviço de Tradução de Texto", "Serviço", "Traduz texto para outro idioma")
Container(TTS, "Serviço de Geração de Áudio", "Serviço", "Transforma texto em áudio")

ContainerQueue(contentStorageTopic, "Tópico de Armazenamento de Conteúdo", "RabbitMQ/Kafka/SQS", "Recebe solicitações para armazenamento de conteúdo")
ContainerQueue(audioExtractionJobTopic, "Tópico de Extração de Áudio", "RabbitMQ/Kafka/SQS", "Recebe solicitações para extração de áudio")
ContainerQueue(audioTranscriptionJobTopic, "Tópico de Transcrição de Áudio", "RabbitMQ/Kafka/SQS", "Recebe solicitações para transcrição de áudio")
ContainerQueue(textTranslationJobTopic, "Tópico de Tradução de Texto", "RabbitMQ/Kafka/SQS", "Recebe solicitações para tradução de texto")
ContainerQueue(textToSpeechJobTopic, "Tópico de Texto para Fala", "RabbitMQ/Kafka/SQS", "Recebe solicitações para transformação de texto em áudio")


Rel(contentPlatform, bucketAudio, "Armazena e recupera áudios", "down")
Rel(contentPlatform, bucketVideo, "Armazena e recupera vídeos", "down")

Rel(bucketVideo, storagePublisher, "Notifica Armazenamento", "right")
Rel(bucketAudio, storagePublisher, "Notifica Armazenamento", "right")
Rel(bucketTrans, storagePublisher, "Notifica Armazenamento", "right")
Rel(bucketTransl, storagePublisher, "Notifica Armazenamento", "right")

Rel(storagePublisher, contentStorageTopic, "Publica solicitação de armazenamento", "right")
Rel(contentStorageTopic, orchestrator, "Envia solicitação de processamento dinâmico", "right")

Rel(orchestrator, contentStorageWatcher, "Define fluxo de trabalho", "down")

Rel(contentStorageWatcher, audioExtractionJobTopic, "Envia solicitação de extração de áudio", "right")
Rel(contentStorageWatcher, audioTranscriptionJobTopic, "Envia solicitação de transcrição de áudio", "right")

Rel(audioExtractionJobTopic, audioExtractor, "Envia áudio para extração", "down")
Rel(audioExtractor, audioTranscriptionJobTopic, "Envia áudio para transcrição", "down")

Rel(audioTranscriptionJobTopic, STT, "Envia áudio para transcrição", "down")
Rel(STT, textTranslationJobTopic, "Envia texto para tradução", "right")

Rel(textTranslationJobTopic, translate, "Envia texto para tradução", "right")
Rel(translate, textToSpeechJobTopic, "Envia texto para transformação em áudio", "right")

Rel(textToSpeechJobTopic, TTS, "Envia texto para transformação em áudio", "down")
Rel(TTS, bucketAudio, "Armazena áudio", "up")

Rel(STT, bucketTrans, "Armazena transcrição", "up")
Rel(translate, bucketTransl, "Armazena tradução", "up")

Rel(orchestrator, audioExtractionJobTopic, "Decide e paraleliza extração de áudio conforme metadados", "right")
Rel(orchestrator, audioTranscriptionJobTopic, "Decide paralelização ou bypass de transcrição", "right")
Rel(orchestrator, textTranslationJobTopic, "Determina necessidade de tradução via metadados", "right")
Rel(orchestrator, textToSpeechJobTopic, "Ativa TTS conforme preferências de workflow", "right")

@enduml

```

## **Componentes Principais:**

1. **Content Platform**:
   - **Tipo**: Web/Mobile
   - **Descrição**: Plataforma onde os usuários podem armazenar e recuperar conteúdos de vídeo e áudio.

2. **Buckets de Armazenamento**:
   - **Bucket de Vídeos**: Armazena vídeos enviados pela plataforma.
   - **Bucket de Áudios**: Armazena áudios extraídos de vídeos ou gerados a partir de texto.
   - **Bucket de Transcrições**: Armazena textos transcritos de áudios.
   - **Bucket de Traduções**: Armazena textos traduzidos.

3. **Serviços de Processamento**:
   - **Storage Publisher**: Publica eventos sempre que há alterações nos buckets de armazenamento.
   - **Content Storage Watcher**: Observa eventos de armazenamento e despacha tarefas conforme necessário.
   - **Orchestrator**: Gerencia o fluxo de trabalho de forma dinâmica, tomando decisões com base em metadados e condições predefinidas.

4. **Serviços Específicos**:
   - **Audio Extractor**: Extrai áudio de vídeos armazenados no Bucket de Vídeos.
   - **STT (Speech-to-Text)**: Transcreve áudios em texto.
   - **Translate**: Traduz textos para outros idiomas.
   - **TTS (Text-to-Speech)**: Converte textos em áudio.

5. **Filas/Tópicos de Mensagens**:
   - **Content Storage Topic**: Recebe notificações de novos conteúdos armazenados.
   - **Audio Extraction Job Topic**: Recebe solicitações para extração de áudio.
   - **Audio Transcription Job Topic**: Recebe solicitações para transcrição de áudio.
   - **Text Translation Job Topic**: Recebe solicitações para tradução de texto.
   - **Text to Speech Job Topic**: Recebe solicitações para conversão de texto em áudio.

## **Fluxo de Trabalho:**

1. **Interação Inicial**:
   - O **Content Platform** armazena vídeos no **Bucket de Vídeos** e áudios no **Bucket de Áudios**.

2. **Publicação de Eventos**:
   - Os buckets notificam o **Storage Publisher** sobre novos conteúdos.
   - O **Storage Publisher** publica eventos no **Content Storage Topic**.

3. **Orquestração Dinâmica**:
   - O **Orchestrator** recebe eventos do **Content Storage Topic**.
   - Com base em metadados, decide quais tarefas devem ser executadas e em que ordem.
   - Comunica-se com o **Content Storage Watcher** para iniciar o fluxo de trabalho definido.

4. **Despacho de Tarefas**:
   - O **Content Storage Watcher** envia solicitações para as filas apropriadas:
     - **Audio Extraction Job Topic** para extração de áudio.
     - **Audio Transcription Job Topic** para transcrição de áudio.
     - **Text Translation Job Topic** para tradução de texto.
     - **Text to Speech Job Topic** para geração de áudio a partir de texto.

5. **Processamento Paralelo**:
   - **Audio Extractor** extrai áudio e armazena no **Bucket de Áudios**.
   - **STT** transcreve áudio em texto e armazena no **Bucket de Transcrições**.
   - **Translate** traduz textos e armazena no **Bucket de Traduções**.
   - **TTS** converte textos em áudio e armazena no **Bucket de Áudios**.

## **Características Chave:**

- **Orquestração de Workflows**:
  - O **Orchestrator** permite a criação de fluxos de trabalho personalizados e condicionais.
  - Tarefas são definidas e sequenciadas com base em metadados e preferências do usuário.

- **Modularidade**:
  - Serviços independentes facilitam a manutenção e atualização do sistema.
  - Novos serviços podem ser adicionados sem impactar significativamente o sistema existente.

- **Paralelização Inteligente**:
  - Tarefas independentes podem ser executadas em paralelo para otimizar desempenho.
  - Decisões sobre paralelização são baseadas em metadados e condições do fluxo de trabalho.

## **Interações Entre Componentes:**

- **Content Platform ↔ Buckets**:
  - Armazena e recupera vídeos e áudios dos buckets correspondentes.

- **Buckets ↔ Storage Publisher**:
  - Notificam o **Storage Publisher** sobre novos conteúdos.

- **Storage Publisher ↔ Content Storage Topic**:
  - Publica eventos de armazenamento para o tópico.

- **Content Storage Topic ↔ Orchestrator**:
  - O **Orchestrator** recebe eventos e decide o fluxo de trabalho.

- **Orchestrator ↔ Content Storage Watcher**:
  - Define e inicia o fluxo de trabalho através do **Content Storage Watcher**.

- **Content Storage Watcher ↔ Filas de Tarefas**:
  - Envia solicitações para as filas apropriadas para processamento.

- **Serviços Específicos ↔ Buckets**:
  - Armazenam resultados (áudios, transcrições, traduções) nos buckets correspondentes.

## **Benefícios da Arquitetura:**

- **Escalabilidade**:
  - Uso de filas e serviços desacoplados permite escalabilidade horizontal.

- **Eficiência**:
  - Processamento paralelo reduz o tempo total de execução das tarefas.

- **Flexibilidade**:
  - Orquestração dinâmica permite adaptação rápida a novos requisitos e fluxos de trabalho.

- **Confiabilidade**:
  - Arquitetura desacoplada aumenta a tolerância a falhas, isolando problemas em serviços individuais.
