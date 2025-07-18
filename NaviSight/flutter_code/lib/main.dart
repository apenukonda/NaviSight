import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:file_picker/file_picker.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Get available cameras
  final cameras = await availableCameras();
  final firstCamera = cameras.first;

  runApp(NaviSightApp(camera: firstCamera));
}

class NaviSightApp extends StatelessWidget {
  final CameraDescription camera;

  const NaviSightApp({Key? key, required this.camera}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NaviSight',
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: Colors.blue,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          secondary: Colors.amber,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
            textStyle: const TextStyle(fontSize: 18),
          ),
        ),
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.blue[300],
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue[300]!,
          secondary: Colors.amber[300]!,
          brightness: Brightness.dark,
        ),
      ),
      themeMode: ThemeMode.system,
      home: WelcomeScreen(camera: camera),
    );
  }
}

class WelcomeScreen extends StatefulWidget {
  final CameraDescription camera;

  const WelcomeScreen({Key? key, required this.camera}) : super(key: key);

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final FlutterTts _flutterTts = FlutterTts();
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _hasSpoken = false;
  bool _isListening = false;
  int _retryCount = 0;

  @override
  void initState() {
    super.initState();
    _initSpeech();
    _initTts();

    // Play welcome message after a delay
    Future.delayed(const Duration(seconds: 1), () {
      _speakWelcomeMessage();
    });
  }

  @override
  void dispose() {
    _flutterTts.stop();
    super.dispose();
  }

  void _initSpeech() async {
    bool available = await _speech.initialize(onStatus: (status) {
      if (status == 'done') {
        setState(() => _isListening = false);
      }
    }, onError: (error) {
      if (_retryCount < 2) {
        setState(() {
          _retryCount++;
          _isListening = false;
        });

        _speak("I didn't hear you. Please say 'yes' or 'continue' to begin.");
        Future.delayed(const Duration(milliseconds: 500), () {
          _startListening();
        });
      }
    });

    if (!available) {
      debugPrint("Speech recognition not available");
    }
  }

  void _initTts() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);

    _flutterTts.setCompletionHandler(() {
      if (!_hasSpoken) {
        setState(() => _hasSpoken = true);
        _startListening();
      }
    });
  }

  Future<void> _speak(String text) async {
    await _flutterTts.speak(text);
  }

  void _speakWelcomeMessage() async {
    await _speak(
        "Welcome to NaviSight. I am your navigation assistant designed to help you navigate indoor spaces. " +
            "I will describe what's around you when you say 'take a picture'. " +
            "To begin, please say 'yes' or 'continue', or press the continue button on your screen.");
  }

  void _startListening() async {
    setState(() => _isListening = true);

    await _speech.listen(
      onResult: (result) {
        if (result.finalResult) {
          final transcript = result.recognizedWords.toLowerCase();
          debugPrint("Recognized: $transcript");

          if (transcript.contains('yes') ||
              transcript.contains('continue') ||
              transcript.contains('start') ||
              transcript.contains('okay') ||
              transcript.contains('ok') ||
              transcript.contains('proceed')) {
            _handleContinue();
          }
        }
      },
      listenFor: const Duration(seconds: 10),
      pauseFor: const Duration(seconds: 3),
      localeId: "en_US",
    );
  }

  void _handleContinue() async {
    if (_speech.isListening) {
      _speech.stop();
    }

    await _speak("Starting NaviSight. Get ready to explore.");

    // Navigate to main screen
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
          builder: (context) => MainScreen(camera: widget.camera)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: IconButton(
                    icon: const Icon(Icons.brightness_6),
                    onPressed: () {
                      // User would implement theme toggle here
                    },
                  ),
                ),
                const Spacer(),
                Text(
                  'NaviSight',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Voice Navigation Assistant',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        "I'll help you navigate indoor spaces by describing what's around you.",
                        style: Theme.of(context).textTheme.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _hasSpoken
                            ? "Please say 'YES' or 'CONTINUE' to begin..."
                            : "Welcome! Loading voice instructions...",
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 64,
                  child: ElevatedButton(
                    onPressed: _handleContinue,
                    child: const Text('Continue'),
                  ),
                ),
                const SizedBox(height: 16),
                if (_isListening)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text("Listening for your response..."),
                    ],
                  ),
                if (_retryCount > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      "Having trouble hearing you. Please speak clearly or press the button.",
                      style: TextStyle(color: Colors.amber[700]),
                      textAlign: TextAlign.center,
                    ),
                  ),
                const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class MainScreen extends StatefulWidget {
  final CameraDescription camera;

  const MainScreen({Key? key, required this.camera}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with WidgetsBindingObserver {
  late CameraController _cameraController;
  late Future<void> _initializeControllerFuture;
  final FlutterTts _flutterTts = FlutterTts();
  final stt.SpeechToText _speech = stt.SpeechToText();

  bool _isCameraActive = false;
  bool _isProcessing = false;
  bool _isListening = false;
  bool _hasPlayedInstructions = false;

  // Analysis results
  String? _sceneDescription;
  List<DetectedObject> _detectedObjects = [];
  String? _warningMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeCamera();
    _initSpeech();
    _initTts();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController.dispose();
    _flutterTts.stop();
    if (_speech.isListening) {
      _speech.stop();
    }
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Handle app lifecycle changes for camera
    if (!_cameraController.value.isInitialized) return;

    if (state == AppLifecycleState.inactive) {
      _cameraController.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }

  void _initializeCamera() {
    _cameraController = CameraController(
      widget.camera,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    _initializeControllerFuture = _cameraController.initialize().then((_) {
      if (!mounted) return;
      setState(() {
        _isCameraActive = true;
      });

      // Play instructions after camera is initialized
      if (!_hasPlayedInstructions) {
        _speak("Say 'take a picture' to describe what's around you. Say 'quit' to return to the welcome screen.")
            .then((_) {
          setState(() => _hasPlayedInstructions = true);
          _startListening();
        });
      }
    }).catchError((error) {
      debugPrint("Error initializing camera: $error");
    });
  }

  void _initSpeech() async {
    await _speech.initialize(onStatus: (status) {
      if (status == 'done') {
        setState(() => _isListening = false);
        // Restart listening
        if (!_isProcessing) {
          Future.delayed(const Duration(milliseconds: 500), () {
            _startListening();
          });
        }
      }
    }, onError: (error) {
      setState(() => _isListening = false);
      debugPrint("Speech recognition error: $error");
      // Restart listening
      if (!_isProcessing) {
        Future.delayed(const Duration(seconds: 1), () {
          _startListening();
        });
      }
    });
  }

  void _initTts() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);
  }

  Future<void> _speak(String text) async {
    return _flutterTts.speak(text);
  }

  void _startListening() async {
    if (_isProcessing) return;

    setState(() => _isListening = true);

    try {
      await _speech.listen(
        onResult: (result) {
          if (result.finalResult) {
            final transcript = result.recognizedWords.toLowerCase();
            debugPrint("Recognized: $transcript");
            _processVoiceCommand(transcript);
          }
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        localeId: "en_US",
      );
    } catch (e) {
      debugPrint("Error listening: $e");
      setState(() => _isListening = false);

      // Try to restart listening
      Future.delayed(const Duration(seconds: 1), () {
        if (!_isProcessing && mounted) {
          _startListening();
        }
      });
    }
  }

  void _stopListening() {
    if (_speech.isListening) {
      _speech.stop();
    }
    setState(() => _isListening = false);
  }

  void _processVoiceCommand(String transcript) {
    if (_isProcessing) return;

    if (transcript.contains("take a picture") ||
        transcript.contains("take picture") ||
        transcript.contains("describe surroundings") ||
        transcript.contains("what's around me")) {
      _captureAndAnalyzeImage();
    } else if (transcript.contains("quit") ||
        transcript.contains("exit") ||
        transcript.contains("go back") ||
        transcript.contains("home")) {
      _navigateToWelcome();
    } else if (transcript.contains("settings")) {
      _speak("Opening settings.");
      // Would navigate to settings
    } else if (transcript.contains("help")) {
      _speak("Opening help.");
      // Would navigate to help
    }
  }

  void _navigateToWelcome() async {
    await _speak("Thank you for using NaviSight. Returning to home screen.");
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
          builder: (context) => WelcomeScreen(camera: widget.camera)),
    );
  }

  Future<void> _captureAndAnalyzeImage() async {
    if (_isProcessing) {
      _speak("I'm still processing your last request, please wait.");
      return;
    }

    if (!_isCameraActive) {
      _speak("Camera is not ready. Please wait a moment and try again.");
      return;
    }

    setState(() {
      _isProcessing = true;
      _sceneDescription = null;
      _detectedObjects = [];
      _warningMessage = null;
    });

    // Stop listening while processing
    _stopListening();

    await _speak("Taking a picture and analyzing your surroundings...");

    try {
      // Take picture
      final image = await _cameraController.takePicture();

      // Process image
      await _analyzeImage(image.path);

      // Speak results
      await _speakAnalysisResults();
    } catch (e) {
      debugPrint("Error capturing or analyzing image: $e");
      await _speak("Sorry, I couldn't analyze the image. Please try again.");
    } finally {
      setState(() => _isProcessing = false);

      // Resume listening
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          _startListening();
        }
      });
    }
  }

  Future<void> _pickAndAnalyzeFile() async {
    if (_isProcessing) {
      _speak("I'm still processing your last request, please wait.");
      return;
    }

    setState(() {
      _isProcessing = true;
      _sceneDescription = null;
      _detectedObjects = [];
      _warningMessage = null;
    });

    // Stop listening while processing
    _stopListening();

    await _speak("Please select a file to analyze.");

    try {
      // Pick an image file from the device
      final result = await FilePicker.platform.pickFiles(type: FileType.image);

      if (result != null && result.files.single.path != null) {
        final filePath = result.files.single.path!;

        await _speak("Analyzing the selected file...");

        // Analyze the selected image file
        await _analyzeImage(filePath);

        // Speak the results of analysis
        await _speakAnalysisResults();
      } else {
        await _speak("No file was selected.");
      }
    } catch (e) {
      debugPrint("Error picking or analyzing file: $e");
      await _speak("Sorry, I couldn't analyze the file. Please try again.");
    } finally {
      setState(() => _isProcessing = false);

      // Resume listening
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          _startListening();
        }
      });
    }
  }

  Future<void> _analyzeImage(String imagePath) async {
    const apiUrl =
        'http://192.168.123.185:8000/predict/'; // update this if needed

    try {
      print('Preparing to send image to API...');
      final request = http.MultipartRequest('POST', Uri.parse(apiUrl));
      request.files.add(await http.MultipartFile.fromPath('file', imagePath));

      print('Sending image...');
      final response = await request.send();

      print('Waiting for response...');
      final responseBody = await response.stream.bytesToString();
      print('Response received. Status code: ${response.statusCode}');
      print('Response body: $responseBody');

      if (response.statusCode == 200) {
        final decoded = jsonDecode(responseBody);
        // final List<dynamic> results = decoded['scene_description'];
        final String content= decoded['scene_description'];
        final String roomType = decoded['roomType'];

        if (!mounted) return;
        setState(() {
          _sceneDescription = "This is a $roomType and the scene can be described as $content";
          // _detectedObjects = results.map((item) {
          //   return DetectedObject(
          //     name: item['label'] as String,
          //     distance: (item['distance'] as num).toStringAsFixed(2),
          //   );
          // }).toList();
          _warningMessage = null;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _sceneDescription = 'Failed to analyze image.';
          _detectedObjects = [];
          _warningMessage =
              'Server responded with status ${response.statusCode}';
        });
      }
    } catch (e, stackTrace) {
      print('❌ ERROR OCCURRED');
      print('Error: $e');
      print('StackTrace: $stackTrace');

      if (!mounted) return;
      setState(() {
        _sceneDescription = 'Error occurred while analyzing image.';
        _detectedObjects = [];
        _warningMessage = 'Error: $e\nStackTrace: $stackTrace';
      });
    }
  }

  String _getRandomSceneDescription() {
    const descriptions = [
      "You are in what appears to be a living room. There's a pathway ahead leading to a doorway.",
      "This looks like a kitchen area with countertops and appliances. There's open space to move ahead.",
      "You're in a hallway with doors on either side. The path continues straight ahead.",
      "This is an office space with a desk and chair. There's room to navigate around the furniture."
    ];
    return descriptions[DateTime.now().millisecond % descriptions.length];
  }

  List<Map<String, String>> _getRandomObjects() {
    final objects = [
      {'name': 'Table', 'distance': '3 feet ahead'},
      {'name': 'Chair', 'distance': '2 feet to the left'},
      {'name': 'Doorway', 'distance': '6 feet ahead'},
      {'name': 'Window', 'distance': '5 feet to the right'}
    ];

    return objects.where((_) => DateTime.now().millisecond % 3 != 0).toList();
  }

  bool _shouldHaveWarning() {
    return DateTime.now().millisecond % 2 == 0;
  }

  String _getRandomWarning() {
    const warnings = [
      "Caution: Table edge is close to your right.",
      "Be careful: There appears to be a step down ahead.",
      "Warning: Low hanging object detected overhead.",
      "Attention: Narrow passage ahead, proceed slowly."
    ];
    return warnings[DateTime.now().millisecond % warnings.length];
  }

  Future<void> _speakAnalysisResults() async {
    if (_sceneDescription == null) return;

    String text = "Scene description: $_sceneDescription ";

    // if (_detectedObjects.isNotEmpty) {
    //   text += "Detected objects: ";
    //   text += _detectedObjects
    //       .map((obj) => "${obj.name} at ${obj.distance}")
    //       .join(", ");
    //   text += ". ";
    // }

    if (_warningMessage != null) {
      text += "Warning: $_warningMessage";
    }

    await _speak(text);
  }

  void _toggleVoiceListener() {
    if (_isListening) {
      _stopListening();
      _speak("Voice commands turned off.");
    } else {
      _startListening();
      _speak(
          "Voice commands turned on. Say 'take a picture' to describe what's around you.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'NaviSight',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.brightness_6),
                    onPressed: () {
                      // User would implement theme toggle here
                    },
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: _isListening ? Colors.green : Colors.red,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isListening
                        ? "Listening for voice commands..."
                        : "Voice commands inactive",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: [
                    // Camera preview
                    AspectRatio(
                      aspectRatio: 0.75, // 3:4 aspect ratio
                      child: FutureBuilder<void>(
                        future: _initializeControllerFuture,
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.done) {
                            return ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: CameraPreview(_cameraController),
                            );
                          } else {
                            return Container(
                              decoration: BoxDecoration(
                                color: Colors.black12,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }
                        },
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Action buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.camera_alt),
                            label: const Text("Take Picture"),
                            onPressed:
                                _isProcessing ? null : _captureAndAnalyzeImage,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                        const SizedBox(
                            width: 10), // Spacing between the buttons
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.upload_file),
                            label: const Text("Upload File"),
                            onPressed:
                                _isProcessing ? null : _pickAndAnalyzeFile,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton.icon(
                      icon: Icon(_isListening ? Icons.mic_off : Icons.mic),
                      label: Text(_isListening
                          ? "Turn Off Voice Commands"
                          : "Turn On Voice Commands"),
                      onPressed: _toggleVoiceListener,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isListening
                            ? Colors.red
                            : Theme.of(context).colorScheme.surface,
                        foregroundColor: _isListening
                            ? Colors.white
                            : Theme.of(context).textTheme.bodyLarge?.color,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Voice commands reference
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Voice Commands:",
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                              "• \"Take a picture\" - Describe surroundings"),
                          const Text("• \"What's around me\" - Analyze scene"),
                          const Text("• \"Quit\" or \"Exit\" - Return to home"),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Analysis results
                    if (_sceneDescription != null)
                      Expanded(
                        child: SingleChildScrollView(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardColor,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Scene Description:",
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                const SizedBox(height: 8),
                                Text(_sceneDescription!),
                                if (_detectedObjects.isNotEmpty) ...[
                                  const SizedBox(height: 16),
                                  Text(
                                    "Detected Objects:",
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(height: 8),
                                  ...(_detectedObjects.map((obj) => Padding(
                                        padding:
                                            const EdgeInsets.only(bottom: 4.0),
                                        child: Text(
                                            '• ${obj.name} (${obj.distance})'),
                                      ))),
                                ],
                                if (_warningMessage != null) ...[
                                  const SizedBox(height: 16),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: Colors.amber,
                                        width: 1,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.warning,
                                            color: Colors.amber),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            _warningMessage!,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: Colors.amber[800],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                      ),
                    // Processing indicator
                    if (_isProcessing)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                            SizedBox(height: 16),
                            Text(
                              "Processing image...",
                              style: TextStyle(color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            // Bottom navigation
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.home),
                      onPressed: _navigateToWelcome,
                      tooltip: "Home",
                    ),
                    IconButton(
                      icon: const Icon(Icons.settings),
                      onPressed: () {
                        _speak("Opening settings.");
                        // Would navigate to settings
                      },
                      tooltip: "Settings",
                    ),
                    IconButton(
                      icon: const Icon(Icons.help),
                      onPressed: () {
                        _speak("Opening help.");
                        // Would navigate to help
                      },
                      tooltip: "Help",
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DetectedObject {
  final String name;
  final String distance;

  DetectedObject({required this.name, required this.distance});
}
