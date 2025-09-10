import logging

from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.planners import BuiltInPlanner
from google.adk.tools import google_search
from google.genai import types as genai_types
from pydantic import BaseModel, Field
from google.genai import types


from .config import config
from .callbacks import (
    collect_research_sources_callback,
    # citation_replacement_callback,
)

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)


class TrendItem(BaseModel):
    name: str = Field(description="The name of the trend.")
    description: str = Field(
        description="A detailed description of the trend (2-3 sentences explaining what it is and why it's popular)."
    )
    techniques: list[str] = Field(
        description="A list of 3-5 specific, actionable techniques or methods related to the trend. Each technique should be concise (2-4 words) and practical."
    )
    popularity: str = Field(
        description="The popularity level of the trend (e.g., 'Rising', 'Viral', 'Emerging', 'Growing')",
        default="Rising",
    )
    difficulty: str = Field(
        description="The difficulty level for consumers (e.g., 'Beginner', 'Intermediate', 'Advanced')",
        default="Beginner",
    )
    key_products: list[str] = Field(
        description="A list of 2-3 key product types or ingredients that are commonly available at Sephora (e.g., 'Hyaluronic Acid Serum', 'Matte Lipstick', 'Heat Protectant Spray'). Only include products that are typical Sephora inventory.",
        default=[],
    )
    target_demographic: str = Field(
        description="The primary demographic interested in this trend (e.g., 'Gen Z', 'Millennials', 'All ages')",
        default="All ages",
    )


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
        thinking_config=genai_types.ThinkingConfig(include_thoughts=False)
    ),
    instruction="""
    You are a Sephora Trend Research Agent, an expert in discovering the latest beauty, skincare, hair, and makeup trends from the internet's most dynamic sources. Your goal is to act like a trend-spotter, focusing on what's new and exciting on social media.

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
    3. **Trends**: You should find trends for each of the following categories: makeup, skincare and hair.
    4. **Technique Quality**: When reporting techniques, focus on specific, actionable methods that people can actually do. Examples of good techniques: "Blend outward", "Pat gently", "Use circular motions", "Apply in layers". Avoid vague terms like "apply properly" or "use technique".
    5. **Comprehensive Information**: For each trend, gather information about:
       - Specific techniques mentioned in tutorials or discussions
       - Popularity indicators (mentions, views, engagement)
       - Difficulty level based on user comments and tutorials
       - Key products or ingredients that are commonly available at Sephora (avoid niche or specialty products)
       - Target demographic based on platform and discussion context
    6. **Sephora Product Focus**: When identifying key products, only include items that are typically sold at Sephora:
       - Common beauty brands (Fenty, Rare Beauty, Charlotte Tilbury, etc.)
       - Standard product categories (serums, foundations, lipsticks, etc.)
       - Popular ingredients (hyaluronic acid, retinol, vitamin C, etc.)
       - Avoid mentioning specific products that may not be available at Sephora
    """,
    # output_model=SephoraTrendsReport,
    tools=[google_search],
    output_key="sephora_trend_research_findings",
    generate_content_config=types.GenerateContentConfig(temperature=0.01),
    after_agent_callback=collect_research_sources_callback,
)

output_composer_agent = LlmAgent(
    model=config.critic_model,
    name="output_composer_agent",
    description="Composes the output of the trend research agent into a pydantic model.",
    instruction="""
    You are a Sephora research output composer agent. You are given the output of the trend research agent and you need to compose it into a pydantic model.
    The output research from the trend research agent is in the {sephora_trend_research_findings_with_citations} key. Make sure to use the citations in the output.
    The output model is SephoraTrendsReport.
    The output model has the following fields:
    - report_summary: str (A comprehensive summary of the overall beauty landscape based on the research)
    - trends: TrendCategory (Contains makeup_trends, skincare_trends, and hair_trends)
    
    Each TrendItem should include:
    - name: Clear, catchy trend name
    - description: 2-3 sentences explaining what it is and why it's popular
    - techniques: 3-5 specific, actionable techniques (2-4 words each, like "Blend outward", "Pat gently")
    - popularity: Level based on research findings ("Rising", "Viral", "Emerging", "Growing")
    - difficulty: Consumer difficulty level ("Beginner", "Intermediate", "Advanced")
    - key_products: 2-3 key product types or ingredients that are commonly available at Sephora
    - target_demographic: Primary demographic ("Gen Z", "Millennials", "All ages")
    
    **IMPORTANT**: 
    - Extract techniques from actual tutorials, comments, and discussions found in the research
    - Base popularity and difficulty on real user feedback and engagement data
    - Identify key products from mentions in the research sources, but only include products that are typically available at Sephora
    - Determine target demographic from platform context and user discussions
    - Ensure all information is grounded in the research findings with proper citations
    """,
    output_key="sephora_trends_report",
    output_schema=SephoraTrendsReport,
)

root_agent = SequentialAgent(
    name="sephora_trend_agent",
    description="A sequential agent that uses the trend research agent to find trends and the output composer agent to compose the output into a pydantic model.",
    sub_agents=[trend_research_agent, output_composer_agent],
)

if __name__ == "__main__":
    import asyncio
    import uuid

    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService

    APP_NAME = "sephora_trend_agent"
    USER_ID = "user1"
    SESSION_ID = str(uuid.uuid4())

    # Create session service and session
    session_service = InMemorySessionService()

    # Create runner with the session service
    runner = Runner(
        agent=root_agent, session_service=session_service, app_name=APP_NAME
    )

    async def call_agent_async(query: str, runner, user_id, session_id):
        """Sends a query to the agent and prints the final response."""
        print(f"\n>>> User Query: {query}")
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID,
        )
        print(
            f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'"
        )

        # Prepare the user's message in ADK format
        content = types.Content(role="user", parts=[types.Part(text=query)])

        # Key Concept: run_async executes the agent logic and yields Events.
        # We iterate through events to find the final answer.
        async for event in runner.run_async(
            user_id=user_id, session_id=session_id, new_message=content
        ):
            # You can uncomment the line below to see *all* events during execution
            print(
                f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}"
            )

            # Key Concept: Only check for final response from the root agent
            if event.is_final_response() and event.author == "output_composer_agent":
                # Get the final session state to extract the structured output
                final_session = await session_service.get_session(
                    app_name=APP_NAME,
                    user_id=USER_ID,
                    session_id=SESSION_ID,
                )

                # Check for the final output in session state
                final_output = None
                if final_session and final_session.state:
                    # Check for the final output from the card composer
                    final_output = final_session.state.get("sephora_trends_report")

                    print(final_output)

                    citations = final_session.state.get(
                        "sephora_trend_research_findings_with_citations"
                    )
                    print(citations)

                # if final_output:
                #     print("\n" + "=" * 80)
                #     print("FINAL SEPHORA TRENDS REPORT OUTPUT")
                #     print("=" * 80)

                #     # Pretty print the structured output
                #     import json

                #     try:
                #         if isinstance(final_output, str):
                #             # Try to parse as JSON if it's a string
                #             parsed_output = json.loads(final_output)
                #         else:
                #             parsed_output = final_output

                #         print(json.dumps(parsed_output, indent=2))
                #     except:
                #         # If not JSON, print as is
                #         print(final_output)

                #     print("=" * 80)
                # else:
                #     print("No final output found in session state.")
                #     if event.content and event.content.parts:
                #         print(f"Event content: {event.content.parts[0].text}")
                # break

    async def run_conversation():
        await call_agent_async(
            query="""start""",
            runner=runner,
            user_id=USER_ID,
            session_id=SESSION_ID,
        )

    asyncio.run(run_conversation())
