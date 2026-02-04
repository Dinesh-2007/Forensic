import os
import requests
import json
import logging
from typing import Dict, List

logger = logging.getLogger("ai_engine")

class LLMAnalyzer:
    """
    AI Engine powered by Bytez API (with Gemini/OpenRouter fallback)
    Analyzes forensic artifacts for patterns and threats.
    """
    
    def __init__(self, api_key: str, bytez_key: str = None):
        self.api_key = api_key
        self.bytez_key = bytez_key
        # OpenRouter fallback model
        self.model = "mistralai/mistral-7b-instruct:free" 
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        # Bytez API
        self.bytez_url = "https://api.bytez.com/models/v2/openai/v1/chat/completions"

    def _call_bytez(self, prompt: str) -> Dict:
        """Call Bytez API with OpenAI-compatible format"""
        if not self.bytez_key:
            return {"success": False, "error": "Bytez API key not configured"}
        
        # Try multiple small models (free tier supports up to 'sm' size)
        models = ["HuggingFaceTB/SmolLM2-1.7B-Instruct", "Qwen/Qwen2.5-1.5B-Instruct", "TinyLlama/TinyLlama-1.1B-Chat-v1.0"]
        
        for model in models:
            try:
                headers = {
                    "Authorization": self.bytez_key,
                    "Content-Type": "application/json"
                }
                
                data = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are an expert cybersecurity analyst specializing in Windows forensics and threat detection. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 2048,
                    "temperature": 0.3
                }
                
                logger.info(f"Trying Bytez model: {model}")
                response = requests.post(self.bytez_url, headers=headers, json=data, timeout=120)
                
                if response.status_code == 200:
                    result = response.json()
                    try:
                        content = result['choices'][0]['message']['content']
                        logger.info(f"Bytez model {model} succeeded")
                        return {"success": True, "content": content}
                    except (KeyError, IndexError) as e:
                        logger.warning(f"Bytez response parse error: {e}")
                        continue
                else:
                    logger.warning(f"Bytez model {model} error ({response.status_code}): {response.text[:200]}")
                    continue
            except Exception as e:
                logger.warning(f"Bytez model {model} request failed: {str(e)}")
                continue
        
        return {"success": False, "error": "All Bytez models failed"}

    def _call_gemini(self, prompt: str) -> Dict:
        """Call Gemini API with given prompt, with model fallback"""
        # Try multiple models in order of preference
        models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-pro"]
        
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            
            data = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.3
                }
            }
            
            try:
                response = requests.post(url, json=data, timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    try:
                        content = result['candidates'][0]['content']['parts'][0]['text']
                        logger.info(f"Gemini model {model} succeeded")
                        return {"success": True, "content": content}
                    except (KeyError, IndexError) as e:
                        logger.error(f"Gemini response structure error: {result}")
                        continue
                elif response.status_code == 429:
                    logger.warning(f"Model {model} rate limited, trying next...")
                    continue
                else:
                    logger.warning(f"Model {model} error ({response.status_code}), trying next...")
                    continue
            except Exception as e:
                logger.warning(f"Model {model} request failed: {str(e)}, trying next...")
                continue
        
        # All models failed
        logger.error("All Gemini models exhausted or failed")
        return {"success": False, "error": "All Gemini models are rate limited."}

    def _call_llm(self, prompt: str) -> Dict:
        """Try Bytez first, then Gemini, then OpenRouter"""
        # Try Bytez first
        if self.bytez_key:
            result = self._call_bytez(prompt)
            if result["success"]:
                return result
            logger.warning("Bytez failed, trying Gemini...")
        
        # Try Gemini
        if self.api_key and self.api_key.startswith("AIza"):
            result = self._call_gemini(prompt)
            if result["success"]:
                return result
            logger.warning("Gemini failed, trying OpenRouter...")
        
        # Fallback to OpenRouter
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            }
            
            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return {"success": True, "content": content}
            else:
                return {"success": False, "error": f"OpenRouter error: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def analyze_artifacts(self, artifacts: Dict) -> Dict:
        """
        Send scraped artifacts to LLM for comprehensive threat analysis
        """
        try:
            # Prepare context (truncate if too large)
            context = self._prepare_context(artifacts)
            
            prompt = f"""You are a Senior Cyber Forensic Analyst. Analyze the following system artifacts for compromise indicators.

ARTIFACTS:
{json.dumps(context, indent=2)}

TASK:
1. Identify top 3 security risks.
2. Flag any specific suspicious processes or registry keys.
3. Rate overall system risk (LOW/MEDIUM/HIGH/CRITICAL).
4. Provide actionable remediation steps.

Respond with ONLY valid JSON in this exact format:
{{
    "risk_level": "HIGH",
    "risk_score": 85,
    "summary": "Short summary of findings",
    "threats": [
        {{"type": "Process", "details": "description of threat", "severity": "Medium"}}
    ],
    "recommendations": ["Action 1", "Action 2"]
}}"""
            
            result = self._call_llm(prompt)
            if result["success"]:
                return self._parse_llm_response(result["content"])
            else:
                return {"error": result["error"]}
                
        except Exception as e:
            logger.error(f"AI Engine Error: {str(e)}")
            return {"error": str(e)}

    def analyze_dataset(self, dataset_summary: Dict) -> Dict:
        """
        Analyze dataset summary with AI for threat intelligence
        """
        prompt = f"""You are an expert Windows Security Analyst and Digital Forensics Investigator.

Analyze this Windows Event Log dataset summary and provide threat intelligence:

DATASET SUMMARY:
{json.dumps(dataset_summary, indent=2)}

Provide a comprehensive security assessment including:
1. Overall threat level (LOW/MEDIUM/HIGH/CRITICAL)
2. Key security concerns identified
3. Potential attack indicators (MITRE ATT&CK techniques if applicable)
4. Timeline anomalies or patterns
5. Recommended immediate actions
6. Investigation priorities

Respond with ONLY valid JSON:
{{
    "threat_level": "MEDIUM",
    "risk_score": 45,
    "executive_summary": "Brief executive summary of findings",
    "key_concerns": ["Concern 1", "Concern 2"],
    "attack_indicators": [
        {{"technique": "T1059", "name": "Command Line Interface", "confidence": "high", "evidence": "description"}}
    ],
    "timeline_analysis": "Analysis of event patterns over time",
    "recommendations": ["Action 1", "Action 2", "Action 3"],
    "investigation_priorities": ["Priority 1", "Priority 2"]
}}"""

        result = self._call_llm(prompt)
        if result["success"]:
            return self._parse_llm_response(result["content"])
        else:
            return {"error": result["error"]}

    def _prepare_context(self, artifacts: Dict) -> Dict:
        """Summarize artifacts to fit context window"""
        summary = {}
        
        # Processes: Extract names and parent/child relationships
        if "processes" in artifacts:
            procs = artifacts["processes"].get("root_processes", [])
            summary["processes"] = [
                f"{p['name']} (PID: {p['pid']})" for p in procs[:20]
            ]
            
        # Registry: Run keys
        if "registry" in artifacts:
             summary["registry"] = artifacts["registry"].get("run_keys", [])[:10]
             
        # Event Logs: Critical only
        if "event_logs" in artifacts:
            summary["events"] = [
                f"{e.get('event_id', 'Unknown')}: {e.get('message', '')[:50]}" 
                for e in artifacts["event_logs"].get("critical_events", [])[:10]
            ]
            
        return summary

    def _parse_llm_response(self, content: str) -> Dict:
        """Extract JSON from potential markdown wrapping"""
        try:
            # Clean up the content
            content = content.strip()
            
            # Remove markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                parts = content.split("```")
                if len(parts) >= 2:
                    content = parts[1]
            
            content = content.strip()
            return json.loads(content)
        except Exception as e:
            logger.warning(f"Failed to parse LLM response as JSON: {e}")
            # Fallback if LLM returns unstructured text
            return {
                "risk_level": "UNKNOWN", 
                "risk_score": 0, 
                "summary": content[:500] if content else "No response from AI"
            }
