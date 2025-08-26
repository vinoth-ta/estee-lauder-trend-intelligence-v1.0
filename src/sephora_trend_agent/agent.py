import json
from datetime import datetime
from typing import Literal, AsyncGenerator
import logging

from google.adk.agents import BaseAgent, LlmAgent, LoopAgent, SequentialAgent
from google.adk.events import Event, EventActions
from google.adk.planners import BuiltInPlanner
from google.adk.tools import google_search
from google.genai import types as genai_types
from pydantic import BaseModel, Field
from google.genai import types


from utils.config import config
from utils.callbacks import collect_research_sources_callback

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)


class TrendItem(BaseModel):
    name: str = Field(description="The name of the trend.")
    description: str = Field(description="A detailed description of the trend.")


class TrendCategory(BaseModel):
    makeup_trends: list[TrendItem] = Field(
        description="A list of emerging makeup trends."
    )
    skincare_trends: list[TrendItem] = Field(
        description="A list of emerging skincare trends."
    )
    hair_trends: list[TrendItem] = Field(description="A list of emerging hair trends.")


class SephoraTrendsReport(BaseModel):
    """A report of emerging beauty trends relevant to Sephora."""

    report_summary: str = Field(
        description="A high-level summary of the overall beauty landscape."
    )
    trends: TrendCategory


trend_research_agent = LlmAgent(
    model=config.critic_model,
    name="sephora_trend_research_agent",
    description="Identifies up-and-coming beauty and style trends using Google Search with source attribution and timestamps.",
    planner=BuiltInPlanner(
        thinking_config=genai_types.ThinkingConfig(include_thoughts=True)
    ),
    instruction="""
    You are a Sephora Trend Research Agent, an expert in discovering the latest beauty, skincare, and makeup trends from the internet's most dynamic sources. Your goal is to act like a trend-spotter, focusing on what's new and exciting on social media.

    **Your Mission:**
    Use the `google_search` tool to find emerging trends from social media platforms. You should focus your search on what people are talking about on TikTok, Instagram, YouTube, and especially Reddit. Also, keep an eye on influential beauty blogs and online magazines.

    **What to look for:**
    - New makeup styles, techniques, and popular products.
    - Innovative skincare ingredients and routines.
    - Viral beauty hacks and challenges.
    - Discussions and reviews of new products on forums like Reddit.
    - Anything that seems to be gaining traction and could be the "next big thing".

    **How to search:**
    - Be creative with your search queries. Think about how real people talk about beauty online.
    - Use terms like: "new makeup trend tiktok", "reddit skincare holy grail", "viral beauty products 2024", "what's trending in makeup on youtube", "new hair trends".
    - Explore different online communities, for example, by searching "site:reddit.com r/SkincareAddiction new trends".
    - Use google trends to find if there is a spefific trend that is gaining traction.

    **CRITICAL RULES FOR REPORTING:**
    1. **Source-Based Reality**: Your findings MUST be based *exclusively* on information found through the `google_search` tool. Do NOT invent, exaggerate, or "hallucinate" any details or trends.
    2. **Sephora Relevance**: Only report on trends that are relevant to Sephora. This means trends related to makeup, skincare, fragrance, hair care, and beauty tools that you would reasonably find at Sephora. If a trend is about something completely unrelated, ignore it.

    """,
    # output_model=SephoraTrendsReport,
    tools=[google_search],
    output_key="sephora_trend_research_findings",
    generate_content_config=types.GenerateContentConfig(temperature=0.01),
)

output_composer_agent = LlmAgent(
    model=config.critic_model,
    name="output_composer_agent",
    description="Composes the output of the trend research agent into a pydantic model.",
    instruction="""
    You are a Sephora research output composer agent. You are given the output of the trend research agent and you need to compose it into a pydantic model.
    The output research from the trend research agent is in the {sephora_trend_research_findings} key.
    The output model is SephoraTrendsReport.
    The output model has the following fields:
    - report_summary: str
    - trends: TrendCategory
    You need to compose the output model based on the output research from the trend research agent.
    """,
    after_agent_callback=collect_research_sources_callback,
    output_key="sephora_trends_report",
    output_schema=SephoraTrendsReport,
)

root_agent = SequentialAgent(
    name="sephora_trend_agent",
    description="A sequential agent that uses the trend research agent to find trends and the output composer agent to compose the output into a pydantic model.",
    sub_agents=[trend_research_agent, output_composer_agent],
)
