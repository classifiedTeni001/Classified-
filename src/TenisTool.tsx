import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  AsyncStorage,
  Dimensions,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

const STYLE_CONFIG = {
  anime: { label: 'Anime', icon: '⛩️', color: '#ff6eb4' },
  realistic: { label: 'Realistic', icon: '🎬', color: '#38bdf8' },
  '2d': { label: '2D', icon: '🎨', color: '#4ade80' },
  '3d': { label: '3D', icon: '💎', color: '#c084fc' },
  motion: { label: 'Motion', icon: '✨', color: '#fb923c' },
};

const MOODS = [
  { id: 'epic and powerful cinematic', label: '⚔️ Epic', color: '#ef4444' },
  { id: 'peaceful and serene calm', label: '🌿 Peaceful', color: '#22c55e' },
  { id: 'dark atmospheric moody', label: '🌑 Dark', color: '#7c3aed' },
  { id: 'romantic soft warm', label: '💕 Romantic', color: '#ec4899' },
  { id: 'intense high-energy action', label: '🔥 Action', color: '#f97316' },
  { id: 'mysterious foggy ethereal', label: '🔮 Mysterious', color: '#0ea5e9' },
  { id: 'cheerful bright colorful joyful', label: '🌟 Cheerful', color: '#eab308' },
  { id: 'melancholic nostalgic emotional', label: '💧 Melancholic', color: '#64748b' },
];

export default function TenisTool() {
  const [tab, setTab] = useState('t2v');
  const [apiKey, setApiKey] = useState('');
  const [style, setStyle] = useState('anime');
  const [mood, setMood] = useState('epic and powerful cinematic');
  const [prompt, setPrompt] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [duration, setDuration] = useState(30);
  const [quality, setQuality] = useState('1080p');
  const [isEnh, setIsEnh] = useState(false);
  const [isGen, setIsGen] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');

  // Load projects from AsyncStorage
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const saved = await AsyncStorage.getItem('tenis_projects');
      if (saved) setProjects(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading projects:', e);
    }
  };

  const saveProjects = async (proj) => {
    try {
      const updated = [...projects, proj];
      await AsyncStorage.setItem('tenis_projects', JSON.stringify(updated));
      setProjects(updated);
    } catch (e) {
      setError('Failed to save project');
    }
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsEnh(true);
    setEnhanced('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Enhance this video prompt for a ${style} animation with mood "${mood}". Make it more vivid, cinematic, and detailed. Keep it under 150 words:\n\n${prompt}`,
          }],
        }),
      });

      if (!res.ok) throw new Error('Claude API error');
      const data = await res.json();
      setEnhanced(data.content[0].text);
    } catch (e) {
      setError(`Enhancement failed: ${e.message}`);
    } finally {
      setIsEnh(false);
    }
  };

  const generateVideo = async () => {
    const p = (enhanced || prompt).trim();
    if (!p || !apiKey) {
      setError('Need prompt and API key');
      return;
    }

    setIsGen(true);
    setError('');
    setProgress(0);
    setVideoUrl(null);
    setGenStatus('🚀 Initializing...');

    try {
      const fullPrompt = `${p}, ${mood} mood, highly detailed, smooth animation, HD quality, ${duration}s duration`;
      
      const res = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'aa50f26b10fef4e2d77b8f5d33b5ef25b4f1a8f5',
          input: {
            prompt: fullPrompt,
            duration: Math.min(duration, 300),
            height: quality === '4k' ? 2160 : quality === '2k' ? 1440 : 1080,
            width: quality === '4k' ? 3840 : quality === '2k' ? 2560 : 1920,
          },
        }),
      });

      if (!res.ok) throw new Error('Replicate API error');
      const pred = await res.json();
      setProgress(5);
      setGenStatus('⏳ Processing...');

      // Poll for result
      const videoUrl = await pollPrediction(pred.id, apiKey);
      setProgress(100);
      setGenStatus('✅ Complete!');
      setVideoUrl(videoUrl);
    } catch (e) {
      setError(`Generation error: ${e.message}`);
    } finally {
      setIsGen(false);
    }
  };

  const pollPrediction = async (id, key) => {
    for (let i = 0; i < 600; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      const data = await res.json();
      setProgress(Math.min(20 + (i / 600) * 72, 92));

      if (data.status === 'succeeded') {
        return Array.isArray(data.output) ? data.output[0] : data.output;
      }
      if (data.status === 'failed' || data.status === 'canceled') {
        throw new Error('Generation failed');
      }
    }
    throw new Error('Timeout');
  };

  const downloadVideo = async (url, filename) => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Permission denied');
        return;
      }

      const downloadPath = FileSystem.documentDirectory + `${filename}.mp4`;
      const res = await FileSystem.downloadAsync(url, downloadPath);
      
      await MediaLibrary.saveToLibraryAsync(res.uri);
      Alert.alert('Success', 'Video saved to gallery!');
    } catch (e) {
      setError(`Download failed: ${e.message}`);
    }
  };

  const saveProject = async () => {
    if (!videoUrl) {
      setError('No video to save');
      return;
    }

    const name = projectName.trim() || `Project_${new Date().toLocaleString()}`;
    
    try {
      const project = {
        id: Date.now(),
        name,
        videoUrl,
        prompt: enhanced || prompt,
        style,
        mood,
        duration,
        quality,
        created: new Date().toLocaleString(),
      };

      await saveProjects(project);
      setProjectName('');
      setError('');
      Alert.alert('Success', 'Project saved!');
    } catch (e) {
      setError(`Failed to save project: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>✨ TENI'S TOOL ✨</Text>
          <Text style={styles.tagline}>AI Video Generator</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 't2v' && styles.tabActive]}
            onPress={() => setTab('t2v')}
          >
            <Text style={styles.tabText}>🎬 Generate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'projects' && styles.tabActive]}
            onPress={() => setTab('projects')}
          >
            <Text style={styles.tabText}>💾 Projects</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'settings' && styles.tabActive]}
            onPress={() => setTab('settings')}
          >
            <Text style={styles.tabText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {/* ERROR */}
        {error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View>}

        {/* TAB CONTENT */}
        {tab === 't2v' && (
          <>
            {/* API KEY */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔑 API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="sk-..."
                placeholderTextColor="rgba(200,200,255,0.25)"
                secureTextEntry
                value={apiKey}
                onChangeText={setApiKey}
              />
            </View>

            {/* STYLE */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎨 Style</Text>
              <View style={styles.buttonRow}>
                {Object.entries(STYLE_CONFIG).map(([key, cfg]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.btn,
                      style === key && { backgroundColor: cfg.color + '33', borderColor: cfg.color }
                    ]}
                    onPress={() => setStyle(key)}
                  >
                    <Text style={styles.btnText}>{cfg.icon} {cfg.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* MOOD */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎭 Mood</Text>
              <View style={styles.moodGrid}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.moodBtn,
                      mood === m.id && { backgroundColor: m.color + '33', borderColor: m.color }
                    ]}
                    onPress={() => setMood(m.id)}
                  >
                    <Text style={styles.btnText}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* DURATION */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⏱️ Duration</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                placeholderTextColor="rgba(200,200,255,0.25)"
                keyboardType="number-pad"
                value={duration.toString()}
                onChangeText={d => setDuration(parseInt(d) || 30)}
              />
              <Text style={styles.hint}>6-300 seconds (max 5 min)</Text>
            </View>

            {/* QUALITY */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📺 Quality</Text>
              <View style={styles.buttonRow}>
                {['720p', '1080p', '2k', '4k'].map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.btn, quality === q && styles.btnActive]}
                    onPress={() => setQuality(q)}
                  >
                    <Text style={styles.btnText}>{q.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PROMPT */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📝 Prompt</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Describe your video..."
                placeholderTextColor="rgba(200,200,255,0.25)"
                multiline
                numberOfLines={4}
                value={prompt}
                onChangeText={setPrompt}
              />
              <TouchableOpacity
                style={[styles.btn, isEnh && styles.btnDisabled]}
                onPress={enhancePrompt}
                disabled={isEnh}
              >
                <Text style={styles.btnText}>
                  {isEnh ? '⏳ Enhancing...' : '✨ Enhance'}
                </Text>
              </TouchableOpacity>

              {enhanced && (
                <View style={styles.enhanced}>
                  <Text style={styles.enhancedTitle}>✨ Enhanced</Text>
                  <Text style={styles.enhancedText}>{enhanced}</Text>
                </View>
              )}
            </View>

            {/* GENERATE */}
            <TouchableOpacity
              style={[styles.generateBtn, isGen && styles.btnDisabled]}
              onPress={generateVideo}
              disabled={isGen}
            >
              <Text style={styles.generateBtnText}>
                {isGen ? '🎬 Generating...' : '🎬 Generate Video'}
              </Text>
            </TouchableOpacity>

            {/* PROGRESS */}
            {isGen && (
              <View style={styles.card}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{genStatus}</Text>
                <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
              </View>
            )}

            {/* VIDEO RESULT */}
            {videoUrl && (
              <View style={[styles.card, styles.resultCard]}>
                <Text style={styles.cardTitle}>🎥 Generated Video</Text>
                <View style={styles.videoPreview}>
                  <Text style={styles.videoPlaceholder}>📹 Video Ready</Text>
                </View>

                {/* SAVE PROJECT */}
                <TextInput
                  style={styles.input}
                  placeholder="Project name..."
                  placeholderTextColor="rgba(200,200,255,0.25)"
                  value={projectName}
                  onChangeText={setProjectName}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={saveProject}>
                  <Text style={styles.saveBtnText}>💾 Save Project</Text>
                </TouchableOpacity>

                {/* DOWNLOAD */}
                <Text style={styles.downloadLabel}>📥 Download</Text>
                <View style={styles.buttonRow}>
                  {['720p', '1080p', '4k'].map(q => (
                    <TouchableOpacity
                      key={q}
                      style={styles.downloadBtn}
                      onPress={() => downloadVideo(videoUrl, `tenis_${q}`)}
                    >
                      <Text style={styles.btnText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* PROJECTS TAB */}
        {tab === 'projects' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💾 Projects ({projects.length})</Text>
            {projects.length === 0 ? (
              <Text style={styles.emptyText}>No projects yet</Text>
            ) : (
              projects.map(proj => (
                <View key={proj.id} style={styles.projectItem}>
                  <View>
                    <Text style={styles.projectName}>{proj.name}</Text>
                    <Text style={styles.projectDate}>{proj.created}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => downloadVideo(proj.videoUrl, proj.name)}
                  >
                    <Text style={styles.btnText}>📥</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ Settings</Text>
            <Text style={styles.settingText}>📊 Max Duration: 5 minutes (300s)</Text>
            <Text style={styles.settingText}>🎬 Quality: 720p, 1080p, 2K, 4K</Text>
            <Text style={styles.settingText}>💾 Storage: AsyncStorage (device local)</Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                Alert.alert('Clear All?', 'This cannot be undone', [
                  { text: 'Cancel', onPress: () => {} },
                  {
                    text: 'Clear',
                    onPress: () => {
                      setProjects([]);
                      AsyncStorage.setItem('tenis_projects', '[]');
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.clearBtnText}>🗑️ Clear All Projects</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a06',
  },
  scroll: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ff6eb4',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(200,200,255,0.5)',
    letterSpacing: 2,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tabActive: {
    backgroundColor: 'rgba(255,110,180,0.12)',
    borderColor: 'rgba(255,110,180,0.25)',
  },
  tabText: {
    color: '#ff6eb4',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 10,
    marginVertical: 8,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
  },
  resultCard: {
    borderColor: 'rgba(255,110,180,0.22)',
    backgroundColor: 'rgba(255,110,180,0.03)',
  },
  cardTitle: {
    fontSize: 11,
    color: 'rgba(200,200,255,0.45)',
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 10,
    color: '#e0e0ff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: 'rgba(200,200,255,0.35)',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'transparent',
    flex: 1,
    minWidth: '45%',
  },
  btnActive: {
    backgroundColor: 'rgba(255,110,180,0.12)',
    borderColor: 'rgba(255,110,180,0.25)',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    color: 'rgba(200,200,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  generateBtn: {
    marginHorizontal: 10,
    marginVertical: 8,
    paddingVertical: 16,
    backgroundColor: 'linear-gradient(135deg,#ff6eb4,#c084fc)',
    borderRadius: 14,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  saveBtn: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  downloadBtn: {
    backgroundColor: 'rgba(56,189,248,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  downloadLabel: {
    fontSize: 11,
    color: 'rgba(200,200,255,0.4)',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6eb4',
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(200,200,255,0.6)',
    marginBottom: 4,
  },
  progressPct: {
    fontSize: 10,
    color: '#c084fc',
    fontWeight: '700',
  },
  videoPreview: {
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  videoPlaceholder: {
    fontSize: 24,
    color: 'rgba(200,200,255,0.5)',
  },
  enhanced: {
    backgroundColor: 'rgba(192,132,252,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.18)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  enhancedTitle: {
    fontSize: 10,
    color: '#c084fc',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
  },
  enhancedText: {
    fontSize: 12,
    color: 'rgba(220,200,255,0.85)',
    lineHeight: 18,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  projectName: {
    fontSize: 12,
    color: 'rgba(200,200,255,0.8)',
    fontWeight: '600',
  },
  projectDate: {
    fontSize: 10,
    color: 'rgba(200,200,255,0.35)',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: 'rgba(200,200,255,0.45)',
    textAlign: 'center',
    paddingVertical: 20,
  },
  settingText: {
    fontSize: 13,
    color: 'rgba(200,200,255,0.7)',
    marginBottom: 10,
    lineHeight: 20,
  },
  clearBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  clearBtnText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
});
