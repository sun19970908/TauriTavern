// ============================================================================
// Flash chat-only script.js（从 script.original.js 的聊天函数闭包生成）
// 398 个顶层声明，331 个 import 符号。
// 不是手写占位；函数体来自原文件。
// ============================================================================

import { getPageForItem, initPagination } from './scripts/pagination.js';
import { hostPlatform, isMobileHost } from './scripts/util/host-identity.js';
import {
    showdown,
    moment,
    DOMPurify,
    Handlebars,
    SVGInject,
    Popper,
    initLibraryShims,
    default as libs,
    lodash,
} from './lib.js';
import { getClientVersion as getBridgeClientVersion, getTauriTavernSettings, invoke, updateTauriTavernSettings } from './tauri-bridge.js';
import { getPromptCacheUsage } from './scripts/util/prompt-cache-usage.js';
import { formatGenerationTimer, updateMessageGenerationInfo } from './scripts/message-generation-info.js';
import {
    prepareMesTextHtmlWithRuntimePolicy,
    replaceMesTextHtmlWithRuntimePolicy,
    replaceTransientMesTextHtmlWithRuntimePolicy,
    writeStreamingMesText,
} from './scripts/tauri/message/mes-text-write.js';
import { createBlockContent } from './scripts/tauri/message/block-content.js';
import { splitMessageBlocks } from './scripts/tauri/message/message-blocks.js';
import { getCodeHighlightCoordinator } from './scripts/tauri/perf/code-highlight-coordinator.js';
import { ChatSurfaceForeignChildError } from './tauri/main/adapters/chat-surface/chat-dom-adapter.js';
import { assertRequiredChatSurfaceParticipants, ChatSurfaceMissingParticipantError } from './tauri/main/services/chat-surface/capability-gate.js';
import { installChatSurfaceRuntime } from './tauri/main/services/chat-surface/install.js';
import { initDrawers, getTopLevelDrawerPanel, isTopLevelDrawerOpen, setTopLevelDrawerOpen, toggleInlineDrawer } from './scripts/drawers.js';
import { getListThumbnailUrl, initializeListThumbnails } from './scripts/tauri/list-thumbnails.js';
import { getStreamingRenderInterval, normalizeStreamingFps } from './scripts/tauri/perf/streaming-render-policy.js';
import {
    CHAT_COMMIT_REASON,
    requestChatCommitCancellation,
    initializeColdSwipes,
    coldSwipesEnabled,
    acceptColdChatPayload,
    discardColdChatPayload,
    releaseCurrentSwipeSource,
    hydrateMessageSwipes,
    readColdSwipeRecord,
    loadCharacterChatPayload,
    loadGroupChatPayload,
    normalizeChatFileName,
    saveCharacterChatPayload,
    saveCharacterChatMetadata,
} from './scripts/chat-payload-transport.js';
import { getActiveChatSnapshot } from './tauri/main/adapters/st/active-chat-ref.js';
import { composeAuthorsNote, extension_prompt_roles, extension_prompt_types, isWorldInfoInjection } from './scripts/extension-prompts.js';
import {
    ChatInputFocusIntent,
    focusChatInput,
    installChatInputFocusKeeper,
    installChatInputYield,
} from './scripts/chat-input-focus.js';
import {
    createLegacyMcpGenerationContext,
    createUnavailableLegacyMcpGenerationContext,
    LegacyMcpOutcomeUnknownError,
} from './scripts/tauritavern/legacy-mcp-tools.js';
import { getAgentGenerationOptions } from './scripts/tauritavern/agent/agent-generation-router.js';
import {
    cancelActiveAgentRun,
    hasActiveAgentRun,
    resumeAndWaitForAgentRun,
    startAndWaitForAgentRun,
    submitGuidanceToActiveAgentRun,
    subscribeAgentRunState,
} from './scripts/tauritavern/agent/agent-run-controller.js';
import { agentErrorMessage } from './scripts/tauritavern/agent/agent-error-presenter.js';
import { normalizeAgentContextPolicy, projectAgentPromptInputs } from './scripts/tauritavern/agent/agent-context-policy.js';
import { createCurrentPromptSnapshotSeed, prepareCurrentPromptPayload } from './tauri/main/api/agent-prompt-snapshot.js';
import { buildPromptAssemblyPayload } from './tauri/main/api/agent-prompt-assembly.js';
import { normalizeAgentSystemPrompt } from './scripts/tauritavern/agent/agent-system-prompt.js';
import { readLegacyToolInvocations, stripOldToolTurns } from './scripts/tauritavern/tool-turn-projection.js';
import {
    buildFrozenRunInputSnapshot,
    updateFrozenMacroContext,
    buildCurrentModelConnectionSnapshot,
    normalizeFrozenRunInputSnapshot,
    snapshotExtensionPromptsForFrozenRun,
} from './scripts/tauritavern/agent/frozen-run-input-snapshot.js';
import {
    enqueueImportedCharacterAgentAssetScan,
    pauseImportedCharacterAgentAssetQueue,
    resumeImportedCharacterAgentAssetQueue,
} from './scripts/tauri/agent-import-postprocess.js';
import { StagedFile } from './tauri/main/services/files/staged-file.js';
import { buildThumbnailUrl } from './tauri/main/context/asset-path-helpers.js';
import {
    captureSettingsSaveState,
    isSettingsConflictError,
    saveSettingsSnapshot,
} from './scripts/tauri/setting/settings-persistence.js';
import { humanizedDateTime, favsToHotswap, getMessageTimeStamp, dragElement, isMobile, initRossMods, autoloadLastChat } from './scripts/RossAscends-mods.js';
import { userStatsHandler, statMesProcess, initStats } from './scripts/stats.js';
import {
    generateKoboldWithStreaming,
    kai_settings,
    loadKoboldSettings,
    getKoboldGenerationData,
    kai_flags,
    koboldai_settings,
    koboldai_setting_names,
    initKoboldSettings,
} from './scripts/kai-settings.js';
import {
    textgenerationwebui_settings as textgen_settings,
    loadTextGenSettings,
    generateTextGenWithStreaming,
    getTextGenGenerationData,
    textgen_types,
    parseTextgenLogprobs,
    parseTabbyLogprobs,
    initTextGenSettings,
} from './scripts/textgen-settings.js';
import {
    world_info,
    getWorldInfoPrompt,
    getWorldInfoSettings,
    setWorldInfoSettings,
    world_names,
    selected_world_info,
    flushWorldInfoSaves,
    deleteWorldInfo,
    importEmbeddedWorldInfo,
    completeCharacterLorebookAdoption,
    checkEmbeddedWorld,
    setWorldInfoButtonClass,
    wi_anchor_position,
    world_info_include_names,
    initWorldInfo,
    charUpdatePrimaryWorld,
    charSetAuxWorlds,
    flushPendingWorldInfoSettings,
} from './scripts/world-info.js';
import {
    groups,
    selected_group,
    saveGroupChat,
    saveGroupMetadata,
    getGroups,
    applyGroupsSnapshot,
    generateGroupWrapper,
    is_group_generating,
    resetSelectedGroup,
    select_group_chats,
    regenerateGroup,
    group_generation_id,
    getGroupChat,
    renameGroupMember,
    createNewGroupChat,
    getGroupAvatar,
    deleteGroupChat,
    renameGroupChat,
    importGroupChat,
    getGroupBlock,
    getGroupCharacterCardsLazy,
    getGroupCharacterCardsSource,
    getGroupDepthPrompts,
} from './scripts/group-chats.js';
import {
    collapseNewlines,
    loadPowerUserSettings,
    playMessageSound,
    fixMarkdown,
    MARKDOWN_FIX_PAIRS,
    power_user,
    persona_description_positions,
    loadMovingUIState,
    loadCharListState,
    getCustomStoppingStrings,
    MAX_CONTEXT_DEFAULT,
    MAX_RESPONSE_DEFAULT,
    renderStoryString,
    sortEntitiesList,
    registerDebugFunction,
    flushEphemeralStoppingStrings,
    resetMovableStyles,
    forceCharacterEditorTokenize,
    applyPowerUserSettings,
    prepareGenerationControls,
    generatedTextFiltered,
    applyStylePins,
} from './scripts/power-user.js';
import {
    CHAT_MESSAGE_ID,
    setOpenAIMessageExamples,
    setOpenAIMessages,
    setupChatCompletionPromptManager,
    prepareOpenAIMessages,
    sendOpenAIRequest,
    loadOpenAISettings,
    oai_settings,
    openai_messages_count,
    chat_completion_sources,
    getChatCompletionModel,
    getChatCompletionPreset,
    isVertexAiClaudeModelId,
    createAgentPromptSnapshot,
    proxies,
    loadProxyPresets,
    selected_proxy,
    initOpenAI,
} from './scripts/openai.js';
import {
    generateNovelWithStreaming,
    getNovelGenerationData,
    getKayraMaxContextTokens,
    loadNovelSettings,
    nai_settings,
    adjustNovelInstructionPrompt,
    parseNovelAILogprobs,
    novelai_settings,
    novelai_setting_names,
    initNovelAISettings,
} from './scripts/nai-settings.js';
import {
    initBookmarks,
    showBookmarksButtons,
    updateBookmarkDisplay,
} from './scripts/bookmarks.js';
import {
    horde_settings,
    loadHordeSettings,
    generateHorde,
    getStatusHorde,
    getHordeModels,
    adjustHordeGenerationParams,
    isHordeGenerationNotAllowed,
    MIN_LENGTH,
    initHorde,
} from './scripts/horde.js';
import {
    cancelDebounce,
    debounce,
    delay,
    trimToEndSentence,
    countOccurrences,
    isOdd,
    sortMoments,
    timestampToMoment,
    download,
    isDataURL,
    getCharaFilename,
    waitUntilCondition,
    escapeRegex,
    resetScrollHeight,
    onlyUnique,
    getBase64Async,
    humanFileSize,
    Stopwatch,
    isValidUrl,
    ensureImageFormatSupported,
    flashHighlight,
    toggleDrawer,
    isElementInViewport,
    copyText,
    escapeHtml,
    saveBase64AsFile,
    uuidv4,
    equalsIgnoreCaseAndAccents,
    importFromExternalUrl,
    shiftUpByOne,
    shiftDownByOne,
    canUseNegativeLookbehind,
    trimSpaces,
    clamp,
    shakeElement,
    createTimeout,
} from './scripts/utils.js';
import { debounce_timeout, GENERATION_TYPE_TRIGGERS, IGNORE_SYMBOL, inject_ids, MEDIA_DISPLAY, MEDIA_SOURCE, MEDIA_TYPE, OVERSWIPE_BEHAVIOR, SCROLL_BEHAVIOR, SWIPE_DIRECTION, SWIPE_SOURCE, SWIPE_STATE } from './scripts/constants.js';
import { activateDeferredThirdPartyExtensions, activateRequiredChatSurfaceExtensions, activateStartupSystemExtensions, applyExtensionSettings, cancelDebouncedMetadataSave, ChatSurfaceRendererConflictError, doDailyExtensionUpdatesCheck, extension_settings, initExtensions, isCodeRenderDelegatedToThirdPartyRenderer, runGenerationInterceptors, startOfflineExtensionsDiscovery } from './scripts/extensions.js';
import { CONNECT_API_MAP, executeSlashCommandsOnChatInput, initDefaultSlashCommands, initSlashCommandAutoComplete, isExecutingCommandsFromChatInput, pauseScriptExecution, stopScriptExecution, UNIQUE_APIS } from './scripts/slash-commands.js';
import {
    tag_map,
    tags,
    filterByTagState,
    isBogusFolder,
    isBogusFolderOpen,
    chooseBogusFolder,
    getTagBlock,
    loadTagsSettings,
    printTagFilters,
    getTagKeyForEntity,
    printTagList,
    createTagMapFromList,
    renameTagKey,
    importTags,
    tag_filter_type,
    compareTagsForSort,
    initTags,
    applyTagsOnCharacterSelect,
    applyTagsOnGroupSelect,
    tag_import_setting,
    applyCharacterTagsToMessageDivs,
} from './scripts/tags.js';
import { checkOpenRouterAuth, initSecrets, primeSecretStateSnapshot, readSecretState, resolveSecretKey, secret_state } from './scripts/secrets.js';
import { markdownExclusionExt } from './scripts/showdown-exclusion.js';
import { markdownUnderscoreExt } from './scripts/showdown-underscore.js';
import { NOTE_MODULE_NAME, initAuthorsNote, setFloatingPrompt, shouldWIAddPrompt } from './scripts/authors-note.js';
import { getRegexedString, getRegexedStringBatchAsync, regex_placement } from './scripts/extensions/regex/engine.js';
import { initLogprobs, saveLogprobsForActiveMessage } from './scripts/logprobs.js';
import { FILTER_STATES, FILTER_TYPES, FilterHelper, isFilterState } from './scripts/filters.js';
import { getCfgPrompt, getGuidanceScale, initCfg } from './scripts/cfg-scale.js';
import {
    force_output_sequence,
    formatInstructModeChat,
    formatInstructModePrompt,
    formatInstructModeExamples,
    formatInstructModeStoryString,
    getInstructStoppingSequences,
    getInstructMacroValues,
} from './scripts/instruct-mode.js';
import { getCurrentLocale, initLocales, t, translate } from './scripts/i18n.js';
import { getFriendlyTokenizerName, getTokenCount, getTokenCountAsync, initTokenizers, saveTokenCache, warmTokenizerCache } from './scripts/tokenizers.js';
import {
    user_avatar,
    primeUserAvatarsSnapshot,
    getUserAvatars,
    getUserAvatar,
    setUserAvatar,
    initPersonas,
    setPersonaDescription,
    initUserAvatar,
    updatePersonaConnectionsAvatarList,
    isPersonaPanelOpen,
} from './scripts/personas.js';
import { getBackgrounds, initBackgrounds, loadBackgroundSettings, background_settings, prefetchBackgrounds } from './scripts/backgrounds.js';
import { hideLoader, showLoader, removePreloader } from './scripts/loader.js';
import { loader } from './scripts/action-loader.js';
import { BulkEditOverlay } from './scripts/BulkEditOverlay.js';
import { appendFileContent, hasPendingFileAttachment, populateFileAttachment, decodeStyleTags, encodeStyleTags, isExternalMediaAllowed, preserveNeutralChat, restoreNeutralChat, formatCreatorNotes, initChatUtilities, addDOMPurifyHooks } from './scripts/chats.js';
import { getPresetManager, initPresetManager } from './scripts/preset-manager.js';
import {
    getLastMessageId,
    initMacros,
} from './scripts/macros.js';
import { POPUP_RESULT, POPUP_TYPE, Popup, callGenericPopup, fixToastrForDialogs } from './scripts/popup.js';
import { renderTemplate, renderTemplateAsync } from './scripts/templates.js';
import { INTERACTABLE_CONTROL_CLASS, initKeyboard } from './scripts/keyboard.js';
import { CONTROL_SHELL_CLASS } from './scripts/legacy-controls.js';
import { AbortReason } from './scripts/util/AbortReason.js';
import { ToolManager } from './scripts/tool-calling.js';
import { extractReasoningFromData, extractReasoningSignatureFromData, initReasoning, parseReasoningInSwipes, PromptReasoning, ReasoningHandler, removeReasoningFromString, updateReasoningUI } from './scripts/reasoning.js';
import { accountStorage } from './scripts/util/AccountStorage.js';
import { initWelcomeScreen, openPermanentAssistantChat, openPermanentAssistantCard, getPermanentAssistantAvatar } from './scripts/welcome-screen.js';
import { captureItemizedPromptsSaveSnapshot, clearItemizedPrompts, deleteItemizedPromptForMessage, deleteItemizedPrompts, findItemizedPromptSet, hasItemizedPromptForMessage, initItemizedPrompts, itemizedParams, itemizedPrompts, loadItemizedPrompts, promptItemize, replaceItemizedPromptText, saveItemizedPrompts, swapItemizedPrompts, unloadItemizedPrompts, upsertItemizedPromptRecord } from './scripts/itemized-prompts.js';
import { getSystemMessageByType, initSystemMessages, SAFETY_CHAT, sendSystemMessage, system_message_types, system_messages } from './scripts/system-messages.js';
import { event_types, eventSource } from './scripts/events.js';
import { initDomHandlers, restoreNumericInput, showNumericAdjustments, setAriaRelation, keepFocus, ensureElementId } from './scripts/dom-handlers.js';
import { makeKeyboardInteractable } from './scripts/legacy-controls.js';
import { SimpleMutex } from './scripts/util/SimpleMutex.js';
import { createGenerationIdleGate } from './scripts/util/generation-idle-gate.js';
import { shouldEmitCharacterMessageEvents, shouldUnblockGenerationAfterUnhandledError } from './scripts/util/generation-lifecycle.js';
import { AudioPlayer } from './scripts/audio-player.js';
import { evaluateMacroEnv, captureContext as captureMacroContext } from './scripts/macros/macro-system.js';
import { MacroEnvBuilder } from './scripts/macros/engine/MacroEnvBuilder.js';
import { MessageFormatter } from './scripts/message-formatter.js';
import { addChatBackupsBrowser } from './scripts/chat-backups.js';
import { onboardingExperimentalMacroEngine } from './scripts/macros/engine/MacroDiagnostics.js';
import { canJumpToSwipeForMessage, canOpenSwipePickerForMessage, initSwipePicker } from './scripts/swipe-picker.js';

export const characterGroupOverlay = new BulkEditOverlay();

export let mesForShowdownParse;

export let converter;

export const systemUserName = 'SillyTavern System';

export const neutralCharacterName = 'Assistant';

let default_user_name = 'User';

export let name1 = default_user_name;

export let name2 = systemUserName;

export let chat = [];

export function replaceChatContents(messages) {
    acceptColdChatPayload(messages);
    for (let index = 0; index < messages.length; index++) {
        chat[index] = messages[index];
    }
    chat.length = messages.length;
}

export let swipeState = SWIPE_STATE.NONE;

let chatSaveTimeout;

let pendingChatSaveTask = null;

let importFlashTimeout;

export let isChatSaving = false;

let chatSaveQueue = Promise.resolve();

let pendingChatSaveTasks = 0;

function updateChatSaveBusyFlag() {
    isChatSaving = pendingChatSaveTasks > 0;
}

function fireAndForgetSaveChat(savePromise, commitReason) {
    const t0 = performance.now();
    savePromise.then(
        () => {
            console.log(`[BYPASS-PERF-FIREFORGET] saveChat(reason=${commitReason}) SUCCESS duration=${(performance.now() - t0).toFixed(1)}ms`);
        },
        (error) => {
            console.error(`[BYPASS-PERF-FIREFORGET] saveChat(reason=${commitReason}) FAILED duration=${(performance.now() - t0).toFixed(1)}ms error=${error?.message || error}`, error);
        },
    );
}

export function isMutationAsyncEnabled() {
    try {
        const v = extension_settings?.tavernHelperToggle?.mutationAsync;
        return v === undefined ? false : v === true;
    } catch {
        return false;
    }
}

export function enqueueChatSave(task) {
    pendingChatSaveTasks += 1;
    updateChatSaveBusyFlag();

    const run = chatSaveQueue
        .catch(() => {})
        .then(async () => {
            try {
                return await task();
            } finally {
                pendingChatSaveTasks -= 1;
                updateChatSaveBusyFlag();
            }
        });

    chatSaveQueue = run.catch(() => {});
    return run;
}

let firstRun = false;

export let settingsReady = false;

let currentVersion = '0.0.0';

export let displayVersion = 'TauriTavern';

let generation_started = new Date();

export let characters = [];

export let this_chid;

export const default_avatar = 'img/ai4.png';

export const system_avatar = 'img/five.png';

export const comment_avatar = 'img/quill.png';

export const default_user_avatar = 'img/user-default.png';

export let CLIENT_VERSION = 'SillyTavern:UNKNOWN:TauriTavern';

const messageTemplate = $('#message_template .mes');

export const chatElement = $('#chat');

let chatVirtualizationRecoveryPromise = null;

function describeChatVirtualizationFault(fault) {
    if (fault instanceof ChatSurfaceForeignChildError) {
        return `<p>${t`Detected an element in the chat, added by an extension or script, that Chat DOM Virtualization cannot manage:`}</p>
            <pre><code>${escapeHtml(fault.selector)}</code></pre>
            <p>${t`Its class or ID usually shows which extension it belongs to. Please turn off that extension or its related feature and reload. You may also consider sending the line above to the extension's author.`}</p>`;
    }
    if (fault instanceof ChatSurfaceRendererConflictError) {
        return `<p>${t`Multiple extensions have code block rendering enabled: ${escapeHtml(fault.displayNames.join(', '))}. Chat DOM Virtualization cannot support multiple renderers at once. Please enable rendering in only one extension.`}</p>`;
    }
    const help = fault instanceof ChatSurfaceMissingParticipantError
        ? `<p>${t`Chat DOM Virtualization requires renderer extensions that support ChatSurface. Use the official versions listed below or later:`}</p>
            <div>${t`JS-Slash-Runner 4.9.1 or later:`} <a href="https://github.com/N0VI028/JS-Slash-Runner" target="_blank" rel="noopener noreferrer">N0VI028/JS-Slash-Runner</a></div>
            <div>${t`LittleWhiteBox 3.0.4 or later:`} <a href="https://github.com/RT15548/LittleWhiteBox" target="_blank" rel="noopener noreferrer">RT15548/LittleWhiteBox</a></div>
            <p>${t`If an extension was installed from another repository, reinstall it from the official repository to receive upstream updates.`}</p>`
        : `<p>${t`Include the details below when you report this problem.`}</p>`;
    const details = [];
    for (let error = fault; error !== undefined; error = error instanceof Error ? error.cause : undefined) {
        details.push(error instanceof Error ? error.message : String(error));
    }
    return `${help}<pre><code>${escapeHtml(details.join('\n'))}</code></pre>`;
}

function offerChatVirtualizationRecovery(fault, { startup = false } = {}) {
    if (chatVirtualizationRecoveryPromise) {
        return chatVirtualizationRecoveryPromise;
    }

    chatVirtualizationRecoveryPromise = (async () => {
        try {
            const result = await Popup.show.confirm(
                t`Chat DOM Virtualization stopped`,
                `${describeChatVirtualizationFault(fault)}<p>${t`Your chat history is not affected.`}</p>`,
                {
                    okButton: t`Disable virtualization and reload`,
                    cancelButton: startup ? t`Abort startup` : t`Keep stopped`,
                    allowVerticalScrolling: true,
                },
            );
            if (result !== POPUP_RESULT.AFFIRMATIVE) {
                return false;
            }
            await updateTauriTavernSettings({ chat_virtualization_enabled: false });
            window.location.reload();
            return true;
        } catch (error) {
            console.error('Failed to recover from Chat DOM Virtualization fault:', error);
            toastr.error(t`Could not disable Chat DOM Virtualization. Check the console for details.`);
            return false;
        }
    })().finally(() => {
        chatVirtualizationRecoveryPromise = null;
    });
    return chatVirtualizationRecoveryPromise;
}

const chatSurface = installChatSurfaceRuntime({
    root: /** @type {HTMLElement} */ (chatElement[0]),
    getMessages: () => chat,
    prepareMaterializeOptions: prepareMessageContent,
    formatMessageContent: (message, messageId) => getMessageTextHTML(message, { messageId }),
    refreshMessageDetails: updateReasoningUI,
    prepareContentTransaction: prepareMesTextHtmlWithRuntimePolicy,
    emitEvent: eventSource.emit.bind(eventSource),
    materializeMessage: ({ message, messageId, frontendSourceHandoffEvent, materializeOptions }) => updateMessageElement(message, {
        messageId,
        frontendSourceHandoffEvent,
        adjustMediaScroll: materializeOptions?.adjustMediaScroll ?? SCROLL_BEHAVIOR.NONE,
        messageHtml: materializeOptions?.messageHtml,
        transient: materializeOptions?.transient,
    }),
    syncMountedViewState: syncMountedChatViewState,
    onFault: error => {
        console.error('Bounded ChatSurface faulted:', error);
        void offerChatVirtualizationRecovery(error);
    },
});

export const finalizeMessageContent = chatSurface.finishContent;

export const refreshChatContent = chatSurface.refreshContent;

let dialogueResolve = null;

let dialogueCloseStop = false;

export let chat_metadata = {};

export let streamingProcessor = null;

let crop_data = undefined;

let is_delete_mode = false;

let stylePinProjectionState = null;

let chatSurfaceStructureMutationDepth = 0;

let fav_ch_checked = false;

let scrollLock = false;

export let abortStatusCheck = new AbortController();

let connectionValidationSuspensionDepth = 0;

export const DEFAULT_SAVE_EDIT_TIMEOUT = debounce_timeout.relaxed;

export const DEFAULT_PRINT_TIMEOUT = debounce_timeout.quick;

let settingsSavePending = false;

let pendingSettingsLoopCounter = 0;

let settingsSavePromise = null;

let settingsSaveQueued = false;

const scheduleSettingsSave = debounce((loopCounter = 0) => {
    settingsSavePending = false;
    return saveSettings(loopCounter);
}, DEFAULT_SAVE_EDIT_TIMEOUT);

export function saveSettingsDebounced(loopCounter = 0) {
    settingsSavePending = true;
    pendingSettingsLoopCounter = loopCounter;
    scheduleSettingsSave(loopCounter);
}

export const saveCharacterDebounced = debounce(() => $('#create_button').trigger('click'), DEFAULT_SAVE_EDIT_TIMEOUT);

let characterListRenderIntent = {};

export function requestCharacterListRender(intent) {
    Object.assign(characterListRenderIntent, intent);
    printCharactersDebounced();
}

export const printCharactersDebounced = debounce(() => { printCharacters(); }, DEFAULT_PRINT_TIMEOUT);

export const MAX_INJECTION_DEPTH = 10000;

export function reloadMarkdownProcessor() {
    converter = new showdown.Converter({
        emoji: true,
        literalMidWordUnderscores: true,
        parseImgDimensions: true,
        tables: true,
        underline: true,
        simpleLineBreaks: true,
        strikethrough: true,
        disableForced4SpacesIndentedSublists: true,
        extensions: [markdownUnderscoreExt()],
    });

    // Inject the dinkus extension after creating the converter
    // Maybe move this into power_user init?
    converter.addExtension(markdownExclusionExt(), 'exclusion');

    return converter;
}

export function getCurrentChatId() {
    if (selected_group) {
        return groups.find(x => x.id == selected_group)?.chat_id;
    } else if (this_chid !== undefined) {
        return characters[this_chid]?.chat;
    }
}

export function isChatOpen({ avatar, groupId }, fileName) {
    const ownerSelected = groupId
        ? selected_group === groupId
        : !selected_group && characters[this_chid]?.avatar === avatar;
    return ownerSelected && getCurrentChatId() === fileName;
}

export const talkativeness_default = 0.5;

export const depth_prompt_depth_default = 4;

export const depth_prompt_role_default = 'system';

const characterPagination = { storageKey: 'Characters_PerPage', defaultPageSize: 50 };

let characterPopupOpener = null;

export let menu_type = '';

export let selected_button = '';

export let create_save = {
    name: '',
    description: '',
    creator_notes: '',
    post_history_instructions: '',
    character_version: '',
    system_prompt: '',
    tags: '',
    creator: '',
    personality: '',
    first_message: '',
    /** @type {FileList|null} */
    avatar: null,
    scenario: '',
    mes_example: '',
    world: '',
    talkativeness: talkativeness_default,
    alternate_greetings: [],
    depth_prompt_prompt: '',
    depth_prompt_depth: depth_prompt_depth_default,
    depth_prompt_role: depth_prompt_role_default,
    extensions: {},
    extra_books: [],
};

export const ANIMATION_DURATION_DEFAULT = 125;

export let animation_duration = ANIMATION_DURATION_DEFAULT;

export let animation_easing = 'ease-in-out';

let popup_type = '';

export let online_status = 'no_connection';

export let is_send_press = false;

export const isGenerating = () => (is_send_press || is_group_generating);

let this_del_mes = -1;

let this_edit_mes_id = undefined;

export let settings;

export let amount_gen = 80;

export let max_context = 2048;

let swipes = true;

export let swipesHidden = false;

let swipeableMessageId = null;

export let lastSwipeInfo = { now: performance.now(), direction: SWIPE_DIRECTION.RIGHT };

export let recentSwipes = 0;

export let extension_prompts = {};

export let main_api;

let abortController = new AbortController();

var kobold_horde_model = '';

export let token;

export let active_character = '';

export let active_group = '';

export const entitiesFilter = new FilterHelper(() => {
    requestCharacterListRender({ resetPage: true });
});

export function getRequestHeaders({ omitContentType = false } = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
    };

    if (omitContentType) {
        delete headers['Content-Type'];
    }

    return headers;
}

export async function pingServer() {
    try {
        const result = await fetch('api/ping', {
            method: 'POST',
            headers: getRequestHeaders({ omitContentType: true }),
        });

        if (!result.ok) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error pinging server', error);
        return false;
    }
}

export function cancelStatusCheck(reason = 'Manually cancelled status check') {
    abortStatusCheck?.abort(new AbortReason(reason));
    abortStatusCheck = new AbortController();
    setOnlineStatus('no_connection');
}

export function isConnectionValidationSuspended() {
    return connectionValidationSuspensionDepth > 0;
}

export async function withConnectionValidationSuspended(reason, callback) {
    connectionValidationSuspensionDepth += 1;
    cancelStatusCheck(reason);

    try {
        return await callback();
    } finally {
        // Keep this scoped so failed profile applications cannot leave connection validation disabled.
        connectionValidationSuspensionDepth -= 1;
    }
}

export function displayOnlineStatus() {
    if (online_status == 'no_connection') {
        $('.online_status_indicator').removeClass('success');
        $('.online_status_text').text($('#API-status-top').attr('no_connection_text'));
    } else {
        $('.online_status_indicator').addClass('success');
        $('.online_status_text').text(online_status);
    }
}

export function setAnimationDuration(ms = null) {
    animation_duration = ms ?? ANIMATION_DURATION_DEFAULT;
    // Set CSS variable to document
    document.documentElement.style.setProperty('--animation-duration', `${animation_duration}ms`);
}

export function setActiveCharacter(entityOrKey) {
    active_character = entityOrKey ? getTagKeyForEntity(entityOrKey) : null;
    if (active_character) active_group = null;
}

export function setActiveGroup(entityOrKey) {
    active_group = entityOrKey ? getTagKeyForEntity(entityOrKey) : null;
    if (active_group) active_character = null;
}

export function startStatusLoading() {
    const connect = document.activeElement.closest('.api_button');
    $('.api_loading').removeClass('displayNone');
    $('.api_button').addClass('disabled').attr({ 'aria-disabled': 'true', 'aria-busy': 'true' });
    if (connect) connect.parentElement.querySelector('.api_loading')?.focus();
}

export function stopStatusLoading() {
    const cancel = document.activeElement.closest('.api_loading');
    const connect = cancel?.parentElement.querySelector('.api_button');
    $('.api_loading').addClass('displayNone');
    $('.api_button').removeClass('disabled').attr('aria-disabled', 'false').removeAttr('aria-busy');
    if (connect) {
        makeKeyboardInteractable(connect);
        connect.focus();
    }
}

export function resultCheckStatus() {
    displayOnlineStatus();
    stopStatusLoading();
}

async function listPersistedCharacterChats(avatar, { simple }) {
    const character = characters.find(character => character.avatar === avatar);
    if (!character) {
        return [];
    }

    const response = await fetch('/api/characters/chats', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({ avatar_url: character.avatar, ch_name: character.name, simple }),
    });

    if (!response.ok) {
        throw new Error('Character chat list could not be loaded');
    }

    const data = await response.json();
    if (data && typeof data === 'object' && data.error === true) {
        throw new Error('Character chat list could not be loaded');
    }

    return Array.isArray(data) ? data : Object.values(data ?? {});
}

async function getPersistedCharacterChats(avatar) {
    const chats = await listPersistedCharacterChats(avatar, { simple: false });
    chats.sort((a, b) => sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)));
    return chats;
}

async function resolvePersistedChat(avatar, chatFiles, currentChat) {
    if (chatFiles.length === 0 || chatFiles.some(chat => normalizeChatFileName(chat.file_name) === currentChat)) {
        return currentChat;
    }
    const [latest] = await getPersistedCharacterChats(avatar);
    return normalizeChatFileName(latest.file_name);
}

export async function selectCharacterById(id, { switchMenu = true, chatFile } = {}) {
    if (characters[id] === undefined) {
        return;
    }
    const avatar = characters[id].avatar;

    if (isChatSaving) {
        toastr.info(t`Please wait until the chat is saved before switching characters.`, t`Your chat is still saving...`);
        return;
    }

    if (selected_group && is_group_generating) {
        return;
    }

    if (selected_group || String(this_chid) !== String(id) || chatFile !== undefined) {
        if (!is_send_press) {
            const chatFiles = chatFile === undefined ? await listPersistedCharacterChats(avatar, { simple: true }) : [];
            const allowNewChat = chatFile === undefined && chatFiles.length === 0;
            setCharacterId(undefined);
            setCharacterName('');
            resetSelectedGroup();
            await clearChat({ clearData: true });
            cancelTtsPlay();
            this_edit_mes_id = undefined;
            selected_button = 'character_edit';
            setCharacterId(id);
            chat_metadata = {};

            await unshallowCharacter(id);
            if (selected_group || String(this_chid) !== String(id)) {
                return;
            }

            // After each await, this switch goes on only while the group, the character and the chat it last saw are unchanged.
            const superseded = seenChat => selected_group || String(this_chid) !== String(id) || characters[id]?.chat !== seenChat;
            const previousChat = characters[id].chat;
            const targetChat = chatFile ?? await resolvePersistedChat(avatar, chatFiles, previousChat);
            if (superseded(previousChat)) {
                return;
            }
            characters[id].chat = targetChat;
            await getChat({ allowNewChat });

            if (superseded(targetChat)) {
                return;
            }
            if (chatFile !== undefined || targetChat !== previousChat) {
                await updateRemoteChatName(characters.findIndex(character => character.avatar === avatar), targetChat).catch(error => {
                    console.error('Chat opened, but its current-chat record could not be saved:', error);
                    toastr.warning(error.message, t`Chat opened, but the character's current chat could not be saved.`);
                });
            }
            focusChatInput(ChatInputFocusIntent.NAVIGATION);
        }
    } else {
        //if clicked on character that was already selected
        switchMenu && (selected_button = 'character_edit');
        await unshallowCharacter(this_chid);
        select_selected_character(this_chid, { switchMenu });
    }

    if (!selected_group && String(this_chid) === String(id)) {
        setActiveCharacter(characters[id]);
    }
}

export function setSelectedCharacterName(name) {
    const header = document.getElementById('rm_button_selected_ch');
    header.querySelector('h2').textContent = name;
    header.querySelector(':scope > .sr-only').hidden = !name;
}

function getBackBlock() {
    const template = $('#bogus_folder_back_template .bogus_folder_select').clone();
    setAriaRelation(template[0].querySelector(':scope > .sr-only'), 'labelledby', template.find('.ch_name')[0]);
    return template;
}

async function getEmptyBlock() {
    const icons = ['fa-dragon', 'fa-otter', 'fa-kiwi-bird', 'fa-crow', 'fa-frog'];
    const texts = [t`Here be dragons`, t`Otterly empty`, t`Kiwibunga`, t`Pump-a-Rum`, t`Croak it`];
    const roll = new Date().getMinutes() % icons.length;
    const params = {
        text: texts[roll],
        icon: icons[roll],
    };
    const emptyBlock = await renderTemplateAsync('emptyBlock', params);
    return $(emptyBlock);
}

async function getHiddenBlock(hidden) {
    const params = {
        text: (hidden > 1 ? t`${hidden} characters hidden.` : t`${hidden} character hidden.`),
    };
    const hiddenBlock = await renderTemplateAsync('hiddenBlock', params);
    return $(hiddenBlock);
}

function getCharacterBlock(item, id) {
    let this_avatar = default_avatar;
    if (item.avatar != 'none') {
        this_avatar = getListThumbnailUrl('avatar', item.avatar);
    }
    // Populate the template
    const template = $('#character_template .character_select').clone();
    template.attr({ 'data-chid': id, 'data-avatar': item.avatar, 'id': `CharID${id}` });
    template.find('img').attr('src', this_avatar);
    template.find('.avatar').attr('title', `[Character] ${item.name}\nFile: ${item.avatar}`);
    template.find('.ch_name').text(item.name).attr('title', `[Character] ${item.name}`);
    if (power_user.show_card_avatar_urls) {
        template.find('.ch_avatar_url').text(item.avatar);
    }
    template.find('.ch_fav_icon').css('display', 'none');
    template.toggleClass('is_fav', item.fav || item.fav == 'true');
    template.find('.ch_fav').val(item.fav);

    const isAssistant = item.avatar === getPermanentAssistantAvatar();
    if (!isAssistant) {
        template.find('.ch_assistant').remove();
    }

    const description = item.data?.creator_notes || '';
    if (description) {
        template.find('.ch_description').text(description);
    } else {
        template.find('.ch_description').hide();
    }

    const auxFieldName = power_user.aux_field || 'character_version';
    const auxFieldValue = (item.data && item.data[auxFieldName]) || '';
    if (auxFieldValue) {
        template.find('.character_version').text(auxFieldValue);
    } else {
        template.find('.character_version').hide();
    }

    const primary = template[0].querySelector(':scope > .sr-only');
    setAriaRelation(primary, 'labelledby', template.find('.ch_name')[0]);
    if (auxFieldValue) setAriaRelation(primary, 'describedby', template.find('.character_version')[0]);

    // Display inline tags
    const tagsElement = template.find('.tags');
    printTagList(tagsElement, { forEntityOrKey: id, tagOptions: { isCharacterList: true } });

    // Add to the list
    return template;
}

export async function printCharacters(fullRefresh = false) {
    const renderIntent = characterListRenderIntent;
    characterListRenderIntent = {};
    fullRefresh ||= renderIntent.resetPage;
    const listId = '#rm_print_characters_block';

    let currentScrollTop = $(listId).scrollTop();

    if (fullRefresh) {
        currentScrollTop = 0;
        await delay(1);
    }

    // Before printing the personas, we check if we should enable/disable search sorting
    verifyCharactersSearchSortRule();

    // We are actually always reprinting filters, as it "doesn't hurt", and this way they are always up to date
    printTagFilters(tag_filter_type.character);
    printTagFilters(tag_filter_type.group_members_list);
    printTagFilters(tag_filter_type.group_candidates_list);

    // We are also always reprinting the lists on character/group edit window, as these ones doesn't get updated otherwise
    applyTagsOnCharacterSelect();
    applyTagsOnGroupSelect();

    const entities = getEntitiesList({ doFilter: true });

    initPagination($('#rm_print_characters_pagination'), {
        ...characterPagination,
        sizeChangerOptions: [10, 25, 50, 100, 250, 500, 1000],
        dataSource: entities,
        pageNumber: fullRefresh ? 1 : undefined,
        callback: async function (/** @type {Entity[]} */ data) {
            const focusTarget = renderIntent.focus;
            delete renderIntent.focus;
            const displayCount = data.filter(entity => entity.type !== 'tag').length;
            const hidden = (characters.length + groups.length) - displayCount;
            const emptyBlock = !data.length ? await getEmptyBlock() : null;
            const hiddenBlock = hidden > 0 && entitiesFilter.hasAnyFilter() ? await getHiddenBlock(hidden) : null;
            const write = () => {
                $(listId).empty();
                if (power_user.bogus_folders && isBogusFolderOpen()) $(listId).append(getBackBlock());
                if (emptyBlock) $(listId).append(emptyBlock);
                for (const entity of data) {
                    switch (entity.type) {
                        case 'character': $(listId).append(getCharacterBlock(entity.item, entity.id)); break;
                        case 'group': $(listId).append(getGroupBlock(entity.item)); break;
                        case 'tag': $(listId).append(getTagBlock(entity.item, entity.entities, entity.hidden, entity.isUseless)); break;
                    }
                }
                if (hiddenBlock) $(listId).append(hiddenBlock);
            };
            if (focusTarget) {
                write();
                const target = document.querySelector(`${listId} > ${focusTarget} > .sr-only`)
                    ?? document.querySelector(`${listId} > .${CONTROL_SHELL_CLASS} > .sr-only`)
                    ?? document.getElementById('rm_button_search');
                target.focus();
            } else {
                const retained = keepFocus(
                    () => document.querySelectorAll(`${listId} > .${CONTROL_SHELL_CLASS}`),
                    item => item.dataset.avatar ?? item.id,
                    write,
                );
                if (!retained) document.getElementById('rm_button_search').focus();
            }

            eventSource.emit(event_types.CHARACTER_PAGE_LOADED);
        },
        afterRender: function () {
            $(listId).scrollTop(currentScrollTop);
        },
    });

    favsToHotswap();
    updatePersonaConnectionsAvatarList();
}

function verifyCharactersSearchSortRule() {
    const searchTerm = entitiesFilter.getFilterData(FILTER_TYPES.SEARCH);
    const searchOption = $('#character_sort_order option[data-field="search"]');
    const selector = $('#character_sort_order');
    const isHidden = searchOption.attr('hidden') !== undefined;

    // If we have a search term, we are displaying the sorting option for it
    if (searchTerm && isHidden) {
        searchOption.removeAttr('hidden');
        searchOption.prop('selected', true);
        flashHighlight(selector);
    }
    // If search got cleared, we make sure to hide the option and go back to the one before
    if (!searchTerm && !isHidden) {
        searchOption.attr('hidden', '');
        $(`#character_sort_order option[data-order="${power_user.sort_order}"][data-field="${power_user.sort_field}"]`).prop('selected', true);
    }
}

export function characterToEntity(character, id) {
    return { item: character, id, type: 'character' };
}

export function groupToEntity(group) {
    return { item: group, id: group.id, type: 'group' };
}

export function tagToEntity(tag) {
    return { item: structuredClone(tag), id: tag.id, type: 'tag', entities: [] };
}

export function getEntitiesList({ doFilter = false, doSort = true } = {}) {
    let entities = [
        ...characters.map((item, index) => characterToEntity(item, index)),
        ...groups.map(item => groupToEntity(item)),
        ...(power_user.bogus_folders ? tags.filter(isBogusFolder).sort(compareTagsForSort).map(item => tagToEntity(item)) : []),
    ];

    // We need to do multiple filter runs in a specific order, otherwise different settings might override each other
    // and screw up tags and search filter, sub lists or similar.
    // The specific filters are written inside the "filterByTagState" method and its different parameters.
    // Generally what we do is the following:
    //   1. First swipe over the list to remove the most obvious things
    //   2. Build sub entity lists for all folders, filtering them similarly to the second swipe
    //   3. We do the last run, where global filters are applied, and the search filters last

    // First run filters, that will hide what should never be displayed
    if (doFilter) {
        entities = filterByTagState(entities);
    }

    // Run over all entities between first and second filter to save some states
    for (const entity of entities) {
        // For folders, we remember the sub entities so they can be displayed later, even if they might be filtered
        // Those sub entities should be filtered and have the search filters applied too
        if (entity.type === 'tag') {
            let subEntities = filterByTagState(entities, { subForEntity: entity, filterHidden: false });
            const subCount = subEntities.length;
            subEntities = filterByTagState(entities, { subForEntity: entity });
            if (doFilter) {
                // sub entities filter "hacked" because folder filter should not be applied there, so even in "only folders" mode characters show up
                subEntities = entitiesFilter.applyFilters(subEntities, { clearScoreCache: false, tempOverrides: { [FILTER_TYPES.FOLDER]: FILTER_STATES.UNDEFINED }, clearFuzzySearchCaches: false });
            }
            if (doSort) {
                sortEntitiesList(subEntities, false);
            }
            entity.entities = subEntities;
            entity.hidden = subCount - subEntities.length;
        }
    }

    // Second run filters, hiding whatever should be filtered later
    if (doFilter) {
        const beforeFinalEntities = filterByTagState(entities, { globalDisplayFilters: true });
        entities = entitiesFilter.applyFilters(beforeFinalEntities, { clearFuzzySearchCaches: false });

        // Magic for folder filter. If that one is enabled, and no folders are display anymore, we remove that filter to actually show the characters.
        if (isFilterState(entitiesFilter.getFilterData(FILTER_TYPES.FOLDER), FILTER_STATES.SELECTED) && entities.filter(x => x.type == 'tag').length == 0) {
            entities = entitiesFilter.applyFilters(beforeFinalEntities, { tempOverrides: { [FILTER_TYPES.FOLDER]: FILTER_STATES.UNDEFINED }, clearFuzzySearchCaches: false });
        }
    }

    // Final step, updating some properties after the last filter run
    const nonTagEntitiesCount = entities.filter(entity => entity.type !== 'tag').length;
    for (const entity of entities) {
        if (entity.type === 'tag') {
            if (entity.entities?.length == nonTagEntitiesCount) entity.isUseless = true;
        }
    }

    // Sort before returning if requested
    if (doSort) {
        sortEntitiesList(entities, false);
    }
    entitiesFilter.clearFuzzySearchCaches();
    return entities;
}

export async function getOneCharacter(avatarUrl) {
    const response = await fetch('/api/characters/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            avatar_url: avatarUrl,
        }),
    });

    if (response.ok) {
        const getData = await response.json();
        getData.name = DOMPurify.sanitize(getData.name);
        getData.chat = String(getData.chat);

        const indexOf = characters.findIndex(x => x.avatar === avatarUrl);

        if (indexOf !== -1) {
            characters[indexOf] = getData;
        } else {
            toastr.error(t`Character ${avatarUrl} not found in the list`, t`Error`, { timeOut: 5000, preventDuplicates: true });
        }
    }
}

export function getCharacterSource(chId = this_chid) {
    const character = characters[chId];

    if (!character) {
        return '';
    }

    const chubId = characters[chId]?.data?.extensions?.chub?.full_path;

    if (chubId) {
        return `https://chub.ai/characters/${chubId}`;
    }

    const pygmalionId = characters[chId]?.data?.extensions?.pygmalion_id;

    if (pygmalionId) {
        return `https://pygmalion.chat/${pygmalionId}`;
    }

    const githubRepo = characters[chId]?.data?.extensions?.github_repo;

    if (githubRepo) {
        return `https://github.com/${githubRepo}`;
    }

    const sourceUrl = characters[chId]?.data?.extensions?.source_url;

    if (sourceUrl) {
        return sourceUrl;
    }

    const risuId = characters[chId]?.data?.extensions?.risuai?.source;

    if (Array.isArray(risuId) && risuId.length && typeof risuId[0] === 'string' && risuId[0].startsWith('risurealm:')) {
        const realmId = risuId[0].split(':')[1];
        return `https://realm.risuai.net/character/${realmId}`;
    }

    const perchanceSlug = characters[chId]?.data?.extensions?.perchance_data?.slug;

    if (perchanceSlug) {
        return `https://perchance.org/ai-character-chat?data=${perchanceSlug}`;
    }

    return '';
}

async function applyCharactersSnapshot(getData) {
    const previousAvatar = this_chid !== undefined ? characters[this_chid]?.avatar : null;
    characters.splice(0, characters.length);

    for (let i = 0; i < getData.length; i++) {
        characters[i] = getData[i];
        characters[i].name = DOMPurify.sanitize(characters[i].name);
    }

    if (previousAvatar) {
        const newCharacterId = characters.findIndex(x => x.avatar === previousAvatar);
        if (newCharacterId >= 0) {
            setCharacterId(newCharacterId);
            await selectCharacterById(newCharacterId, { switchMenu: false });
        } else {
            await Popup.show.text(t`ERROR: The active character is no longer available.`, t`The page will be refreshed to prevent data loss. Press "OK" to continue.`);
            location.reload();
            return false;
        }
    }

    return true;
}

export async function getCharacters() {
    const response = await fetch('/api/characters/all', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({}),
    });
    if (response.ok) {
        const getData = await response.json();
        const applied = await applyCharactersSnapshot(getData);
        if (!applied) {
            return;
        }

        await getGroups();
        await printCharacters(true);
    } else {
        console.error('Failed to fetch characters:', response.statusText);
        const errorData = await response.json();
        if (errorData?.overflow) {
            await Popup.show.text(t`Character data length limit reached`, t`The character list payload is too large. Restart the app and report this issue if it persists.`);
        }
    }
}

export async function prepareCurrentChatFileChange({ saveEdits }) {
    if (is_send_press || is_group_generating) throw new Error(t`Stop generation before deleting or renaming the current chat.`);
    if (saveEdits) {
        await saveChatConditional();
        return;
    }
    cancelDebouncedChatSave();
    cancelDebouncedMetadataSave();
    await enqueueChatSave(async () => {});
}

export async function deleteCharacterChat(avatar, fileName) {
    const characterId = characters.findIndex(character => character.avatar === avatar);
    if (characterId === -1) throw new Error(`Character not found: ${avatar}`);
    await unshallowCharacter(String(characterId));
    if (isChatOpen({ avatar }, fileName)) {
        await prepareCurrentChatFileChange({ saveEdits: false });
    }

    const response = await fetch('/api/chats/delete', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({ chatfile: `${fileName}.jsonl`, avatar_url: avatar }),
    });
    if (!response.ok) throw new Error(`Could not delete chat "${fileName}": ${response.status} ${response.statusText}`);

    try {
        await replaceCurrentChat(avatar, fileName);
    } catch (error) {
        console.error('Chat deleted, but its replacement could not be selected:', error);
        toastr.warning(error.message, t`Chat deleted, but another chat could not be selected.`);
    }
    await eventSource.emit(event_types.CHAT_DELETED, fileName);
}

export async function replaceCurrentChat(avatar = characters[this_chid]?.avatar, fileName) {
    const owner = characters.find(character => character.avatar === avatar);
    if (!owner) throw new Error(`Character not found: ${avatar}`);
    fileName ??= owner.chat;
    if (owner.chat !== fileName) return;

    const chats = await getPersistedCharacterChats(avatar);
    if (isChatOpen({ avatar }, fileName)) {
        await clearChat({ clearData: true });
    }
    const character = characters.find(character => character.avatar === avatar);
    // Navigation during preparation owns the newer current-chat choice.
    if (character?.chat !== fileName) return;

    const existingChat = chats[0];
    const nextName = existingChat ? normalizeChatFileName(existingChat.file_name) : `${character.name} - ${humanizedDateTime()}`;
    const wasOpen = isChatOpen({ avatar }, fileName);
    if (wasOpen) {
        chat_metadata = {};
        character.chat = nextName;
        $('#selected_chat_pole').val(nextName);
        await getChat({ allowNewChat: !existingChat });
    }
    // Persist only after the replacement owns the in-memory chat.
    const characterId = characters.findIndex(character => character.avatar === avatar);
    if (!wasOpen || characters[characterId]?.chat === nextName) {
        await updateRemoteChatName(characterId, nextName).catch(error => {
            console.error('Chat deleted, but its current-chat record could not be saved:', error);
            toastr.warning(error.message, t`Chat deleted, but the character's current chat could not be saved.`);
        });
    }
}

export async function showMoreMessages(messagesToLoad = null) {
    if (shouldUseBoundedChatSurface()) {
        throw new Error('Show More is unavailable while bounded ChatSurface is active');
    }
    const mountedMessageIds = chatSurface.getMountedMessageIds();
    const firstDisplayedMesId = mountedMessageIds[0];
    let messageId = Number(firstDisplayedMesId);
    let count = messagesToLoad || power_user.chat_truncation || Number.MAX_SAFE_INTEGER;

    // If there are no messages displayed, or the message somehow has no mesid, we default to one higher than last message id,
    // so the first "new" message being shown will be the last available message
    if (isNaN(messageId)) {
        messageId = getLastMessageId() + 1;
    }

    console.debug('Inserting messages before', messageId, 'count', count, 'chat length', chat.length);
    const prevHeight = getChatScrollHeight();
    const showMoreButton = $('#show_more_messages');
    const isButtonInView = isElementInViewport(showMoreButton[0]);

    const firstId = clamp(messageId - count, 0, Infinity);
    const nextIds = new Set(mountedMessageIds);
    for (let id = firstId; id < messageId; id += 1) {
        nextIds.add(id);
    }
    chatSurface.reconcileMounted({
        includeMessageIds: [...nextIds].sort((left, right) => left - right),
    });

    refreshActiveSwipeButtons();

    if (firstId === 0) {
        showMoreButton.remove();
    }

    if (isButtonInView) {
        const newHeight = getChatScrollHeight();
        setChatScrollTop(newHeight - prevHeight);
    }

    applyStylePins();
    await eventSource.emit(event_types.MORE_MESSAGES_LOADED);
}

export async function printMessages({ frontendSourceHandoffEvent = null } = {}) {
    const effectiveHandoffEvent = frontendSourceHandoffEvent !== null && isCodeRenderDelegatedToThirdPartyRenderer()
        ? frontendSourceHandoffEvent
        : null;

    let startIndex = 0;
    const count = power_user.chat_truncation || Number.MAX_SAFE_INTEGER;

    if (shouldUseBoundedChatSurface()) {
        $('#show_more_messages').remove();
    } else if (chat.length > count) {
        startIndex = chat.length - count;
        chatElement.append('<div id="show_more_messages">Show more messages</div>');
    }

    await redisplayChat({ startIndex, fade: false, frontendSourceHandoffEvent: effectiveHandoffEvent });

    scrollChatToBottom({ waitForFrame: true });
    delay(debounce_timeout.short).then(() => scrollOnMediaLoad());
}

export async function redisplayChat({ targetChat = chat, startIndex = 0, fade = true, frontendSourceHandoffEvent = null } = {}) {
    if (targetChat !== chat) {
        throw new Error('redisplayChat only accepts the canonical chat array');
    }
    const t1 = performance.now();
    const result = await chatSurface.render({
        messages: targetChat,
        startIndex,
        frontendSourceHandoffEvent,
    });
    if (result.bounded) {
        if (!fade) {
            refreshSwipeButtons(false, false);
        }
        console.info(`Rendered bounded projection (${result.mountedCount}/${targetChat.length}) in ${((performance.now() - t1) / 1000).toFixed(3)} seconds.`);
        return;
    }

    if (result.replaceMessageIds.length > 0) {
        applyCharacterTagsToMessageDivs({ mesIds: result.replaceMessageIds });
    }

    refreshSwipeButtons(false, fade);
    applyStylePins();
    updateEditArrowClasses();

    console.info(`Rendered ${result.replaceMessageIds.length} messages in ${((performance.now() - t1) / 1000).toFixed(3)} seconds.`);
}

export function scrollOnMediaLoad() {
    const started = Date.now();
    const media = chatElement.find('.mes_block img, .mes_block video, .mes_block audio').toArray();
    let mediaLoaded = 0;

    for (const currentElement of media) {
        if (currentElement instanceof HTMLImageElement) {
            if (currentElement.complete) {
                incrementAndCheck();
            } else {
                currentElement.addEventListener('load', incrementAndCheck);
                currentElement.addEventListener('error', incrementAndCheck);
            }
        }
        if (currentElement instanceof HTMLMediaElement) {
            if (currentElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                incrementAndCheck();
            } else {
                currentElement.addEventListener('loadeddata', incrementAndCheck);
                currentElement.addEventListener('error', incrementAndCheck);
            }
        }
    }

    function incrementAndCheck() {
        const MAX_DELAY = 1000; // 1 second
        if ((Date.now() - started) > MAX_DELAY) {
            return;
        }
        mediaLoaded++;
        if (mediaLoaded === media.length) {
            scrollChatToBottom({ waitForFrame: true });
        }
    }
}

export function cancelDebouncedChatSave() {
    if (chatSaveTimeout) {
        console.debug('Debounced chat save cancelled');
        clearTimeout(chatSaveTimeout);
        chatSaveTimeout = null;
    }
    pendingChatSaveTask = null;
}

export async function clearChat({ clearData = false } = {}) {
    cancelDebouncedChatSave();
    cancelDebouncedMetadataSave();
    closeMessageEditor();
    getCodeHighlightCoordinator().reset();
    extension_prompts = {};
    if (is_delete_mode) {
        $('#dialogue_del_mes_cancel').trigger('click');
    }
    //This will also remove non '.mes' elements, e.g. '<div id="show_more_messages">Show more messages</div>'.
    resetChatSurfaceView({ includeAuxiliary: true });
    if ($('.zoomed_avatar[forChar]').length) {
        console.debug('saw avatars to remove');
        $('.zoomed_avatar[forChar]').remove();
    } else { console.debug('saw no avatars'); }

    await saveItemizedPrompts(getCurrentChatId());
    unloadItemizedPrompts();

    if (clearData) {
        chat.length = 0;
        releaseCurrentSwipeSource();
    }
}

export async function deleteLastMessage() {
    await deleteMessage(chat.length - 1);
}

export async function deleteMessage(id, swipeDeletionIndex = undefined, askConfirmation = false) {
    const index = typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id;
    if (!Number.isInteger(index) || index < 0 || index >= chat.length) {
        throw new RangeError(`Invalid message id: ${String(id)}`);
    }
    const element = chatSurface.getMessageElement(index);
    const ownedFocus = element?.contains(document.activeElement);
    const canDeleteSwipe = swipeDeletionIndex !== undefined && swipeDeletionIndex !== null;
    if (canDeleteSwipe) {
        if (swipeDeletionIndex < 0) {
            throw new Error('Swipe index cannot be negative');
        }
        if (!Array.isArray(chat[index].swipes)) {
            throw new Error('Message has no swipes to delete');
        }
        if (chat[index].swipes.length <= swipeDeletionIndex) {
            throw new Error('Swipe index out of bounds');
        }
    }

    let deleteOnlySwipe = canDeleteSwipe;
    if (askConfirmation) {
        const result = await callGenericPopup(t`Are you sure you want to delete this message?`, POPUP_TYPE.CONFIRM, null, {
            label: t`Delete Message`,
            okButton: canDeleteSwipe ? t`Delete Swipe` : t`Delete Message`,
            cancelButton: 'Cancel',
            customButtons: canDeleteSwipe ? [t`Delete Message`] : null,
        });
        if (!result) {
            return;
        }
        deleteOnlySwipe = canDeleteSwipe && result === POPUP_RESULT.AFFIRMATIVE; // Default button, not the custom one
    }

    if (deleteOnlySwipe) {
        await deleteSwipe(swipeDeletionIndex, index);
        return;
    }

    const deletedMessage = chat[index];
    deleteItemizedPromptForMessage(index);
    chat.splice(index, 1);

    chat_metadata.tainted = true;

    updateViewMessageIds();
    saveChatDebounced();
    void cleanupDeletedMessageStates([deletedMessage]);

    if (this_edit_mes_id === index) {
        this_edit_mes_id = undefined;
        syncChatSurfaceProjectionHold();
    }

    refreshActiveSwipeButtons();

    if (ownedFocus && document.activeElement === document.body) focusMessageOrInput(index);
    await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
}

function focusMessageOrInput(messageId) {
    const element = chatSurface.getMessageElement(messageId) ?? chatSurface.getMessageElement(messageId - 1);
    if (element) element.focus({ preventScroll: true });
    else focusChatInput(ChatInputFocusIntent.RESTORATION);
}

export const reloadChatMutex = new SimpleMutex(reloadCurrentChatUnsafe);

export const reloadCurrentChat = reloadChatMutex.update.bind(reloadChatMutex);

export async function reloadCurrentChatUnsafe() {
    preserveNeutralChat();
    await clearChat({ clearData: true });

    if (selected_group) {
        await getGroupChat(selected_group, true);
    } else if (this_chid !== undefined) {
        await getChat();
    } else {
        resetChatState();
        restoreNeutralChat();
        await getCharacters();
        await printMessages();
        await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
    }

    refreshSwipeButtons();
}

const userInputGenerateMutex = new SimpleMutex(generateFromChatInput);

export async function sendTextareaMessage() {
    // don't proceed during swipeGenerate()
    if (swipeState == SWIPE_STATE.EDITING) {
        toastr.warning(t`Confirm the edit to start a generation.`, t`You cannot send a message during a swipe-edit.`);
        return;
    }
    if (swipeState !== SWIPE_STATE.NONE) return; // don't proceed if mid-swipe.
    if (await maybeSubmitAgentGuidanceFromComposer()) return;
    return await userInputGenerateMutex.update();
}

async function generateFromChatInput() {
    if (is_send_press) return;
    if (isExecutingCommandsFromChatInput) return;

    hideSwipeButtons(); //Swipe buttons must be hidden now, otherwise concurrent generations are possible.

    let routeToAgentMode = false;
    try {
        let generateType = 'normal';
        // "Continue on send" is activated when the user hits "send" (or presses enter) on an empty chat box, and the last
        // message was sent from a character (not the user or the system).
        const textareaText = String($('#send_textarea').val());
        const isSlashCommand = textareaText.trim().startsWith('/');
        const lastMessage = chat.at(-1);
        if (power_user.continue_on_send &&
            !hasPendingFileAttachment() &&
            !textareaText &&
            !selected_group &&
            chat.length &&
            !lastMessage.is_user &&
            !lastMessage.is_system
        ) {
            generateType = 'continue';
        }

        const agentOptions = await getAgentGenerationOptions({
            generationType: generateType,
            isSlashCommand,
            mainApi: main_api,
            selectedGroup: selected_group,
        });
        routeToAgentMode = Boolean(agentOptions.agentMode);

        if (textareaText && !selected_group && this_chid === undefined && name2 !== neutralCharacterName) {
            await newAssistantChat({ temporary: false });
        }

        return await Generate(generateType, agentOptions);
    } catch (error) {
        const message = agentErrorMessage(error);
        if (routeToAgentMode || message.startsWith('agent.')) {
            toastr.error(message, t`Agent Mode`);
        }
        throw error;
    } finally {
        showSwipeButtons();
    }
}

function getAgentGuidanceComposerText() {
    return String($('#send_textarea').val() ?? '').trim();
}

export function canSubmitAgentGuidance(text) {
    return hasActiveAgentRun()
        && Boolean(text.trim());
}

function syncChatInputState() {
    const guidanceReady = canSubmitAgentGuidance(getAgentGuidanceComposerText());
    if (guidanceReady) {
        document.body.dataset.agentGuidanceReady = 'true';
    } else {
        delete document.body.dataset.agentGuidanceReady;
    }
    const label = guidanceReady ? 'Submit guidance' : 'Send a message';
    $('#send_but').attr({
        'aria-label': translate(label),
        title: translate(label),
        'data-i18n': `[aria-label]${label};[title]${label}`,
    });
    const status = document.getElementById('chat_generation_status');
    const statusKey = document.body.dataset.generating === 'true' ? 'Generating…' : 'Ready';
    if (status.dataset.i18n !== statusKey) {
        status.dataset.i18n = statusKey;
        status.textContent = translate(statusKey);
    }
}

async function maybeSubmitAgentGuidanceFromComposer() {
    if (!canSubmitAgentGuidance(getAgentGuidanceComposerText())) {
        syncChatInputState();
        return false;
    }

    const text = getAgentGuidanceComposerText();
    const result = await Popup.show.confirm(
        t`Guide the Agent?`,
        `<p>${t`This text will be inserted as user guidance into the next Agent model request. It will not be saved as a regular chat message.`}</p>`,
        {
            okButton: t`Yes`,
            cancelButton: t`No`,
        },
    );
    if (result !== POPUP_RESULT.AFFIRMATIVE) {
        syncChatInputState();
        return true;
    }

    try {
        await submitGuidanceToActiveAgentRun(text);
    } catch (error) {
        toastr.error(agentErrorMessage(error), t`Agent Mode`);
        throw error;
    }

    $('#send_textarea').val('')[0]?.dispatchEvent(new Event('input', { bubbles: true }));
    syncChatInputState();
    return true;
}

let nonSystemDepthByMesId = null;

function rebuildNonSystemDepthByMesId() {
    const depthByMesId = new Int32Array(chat.length);
    depthByMesId.fill(-1);

    let depth = 0;
    for (let id = chat.length - 1; id >= 0; id -= 1) {
        if (!chat[id].is_system) {
            depthByMesId[id] = depth;
            depth += 1;
        }
    }

    nonSystemDepthByMesId = depthByMesId;
}

function getNonSystemDepth(messageId) {
    if (!Number.isInteger(messageId) || messageId < 0) {
        return undefined;
    }

    if (!nonSystemDepthByMesId || nonSystemDepthByMesId.length !== chat.length) {
        rebuildNonSystemDepthByMesId();
    }

    const depth = nonSystemDepthByMesId[messageId];
    return depth >= 0 ? depth : undefined;
}

function getMessageFormattingRegexContext(isUser, messageId, isReasoning = false) {
    const numericMessageId = Number(messageId);
    const placement = isReasoning
        ? regex_placement.REASONING
        : (isUser
            ? regex_placement.USER_INPUT
            : (chat[numericMessageId]?.extra?.type === 'narrator'
                ? regex_placement.SLASH_COMMAND
                : regex_placement.AI_OUTPUT));

    return {
        placement,
        depth: getNonSystemDepth(numericMessageId),
    };
}

const MESSAGE_TAG_QUOTES = /<([^>]+)>/g;

const MESSAGE_QUOTES = /<style>[\s\S]*?<\/style>|```[\s\S]*?```|~~~[\s\S]*?~~~|``[\s\S]*?``|`[\s\S]*?`|(".*?")|(\u201C.*?\u201D)|(\u00AB.*?\u00BB)|(\u300C.*?\u300D)|(\u300E.*?\u300F)|(\uFF02.*?\uFF02)/gim;

function prepareMessageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) {
    if (!mes) return null;
    if (Number(messageId) === 0 && !isSystem && !isUser && !isReasoning) {
        // Display substitution must not rewrite the saved greeting or its swipe.
        mes = substituteParams(mes, { name2Override: ch_name });
    }
    const sourceText = mes;
    isSystem = isSystem && ch_name === systemUserName;
    const promptBias = power_user.user_prompt_bias && substituteParams(power_user.user_prompt_bias);
    if (!power_user.show_user_prompt_bias && ch_name && !isUser && !isSystem && promptBias && mes.startsWith(promptBias)) {
        mes = mes.slice(promptBias.length);
    }

    const context = { ch_name, isSystem, isUser, messageId, isReasoning };
    const { placement, depth } = getMessageFormattingRegexContext(isUser, messageId, isReasoning);
    const regex = isSystem ? null : {
        placement,
        params: { characterOverride: ch_name, isMarkdown: true, depth },
    };
    if (regex) mes = MessageFormatter.runStage(MessageFormatter.stage.BEFORE_REGEX, mes, context);
    return { sourceText, text: mes, context, regex, sanitizerOverrides };
}

export function messageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) {
    const input = prepareMessageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides, isReasoning);
    const text = input?.regex
        ? getRegexedString(input.text, input.regex.placement, input.regex.params)
        : input?.text;
    return finishMessageFormatting(input, text);
}

function finishMessageFormatting(input, mes = input?.text) {
    if (!input) return '';
    const { ch_name, isSystem, isUser } = input.context;
    const { sanitizerOverrides } = input;
    mesForShowdownParse = input.sourceText;
    if (!isSystem) mes = MessageFormatter.runStage(MessageFormatter.stage.AFTER_REGEX, mes, input.context);

    if (power_user.auto_fix_generated_markdown) {
        mes = fixMarkdown(mes, true);
    }

    if (!isSystem && power_user.encode_tags) {
        mes = canUseNegativeLookbehind()
            ? mes.replaceAll('<', '&lt;').replace(new RegExp('(?<!^|\\n\\s*)>', 'g'), '&gt;')
            : mes.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    // Make sure reasoning strings are always shown, even if they include "<" or ">"
    [power_user.reasoning.prefix, power_user.reasoning.suffix].forEach((reasoningString) => {
        if (!reasoningString || !reasoningString.trim().length) {
            return;
        }
        // Only replace the first occurrence of the reasoning string
        if (mes.includes(reasoningString)) {
            mes = mes.replace(reasoningString, escapeHtml(reasoningString));
        }
    });

    if (!isSystem) {
        // Save double quotes in tags as a special character to prevent them from being encoded
        if (!power_user.encode_tags) {
            mes = mes.replace(MESSAGE_TAG_QUOTES, function (_, contents) {
                return '<' + contents.replace(/"/g, '\ufffe') + '>';
            });
        }

        mes = mes.replace(
            MESSAGE_QUOTES,
            function (match, p1, p2, p3, p4, p5, p6) {
                if (p1) {
                    // English double quotes
                    return `<q>"${p1.slice(1, -1)}"</q>`;
                } else if (p2) {
                    // Curly double quotes “ ”
                    return `<q>“${p2.slice(1, -1)}”</q>`;
                } else if (p3) {
                    // Guillemets « »
                    return `<q>«${p3.slice(1, -1)}»</q>`;
                } else if (p4) {
                    // Corner brackets 「 」
                    return `<q>「${p4.slice(1, -1)}」</q>`;
                } else if (p5) {
                    // White corner brackets 『 』
                    return `<q>『${p5.slice(1, -1)}』</q>`;
                } else if (p6) {
                    // Fullwidth quotes ＂ ＂
                    return `<q>＂${p6.slice(1, -1)}＂</q>`;
                } else {
                    // Return the original match if no quotes are found
                    return match;
                }
            },
        );

        // Restore double quotes in tags
        if (!power_user.encode_tags) {
            mes = mes.replace(/\ufffe/g, '"');
        }

        mes = mes.replaceAll('\\begin{align*}', '$$');
        mes = mes.replaceAll('\\end{align*}', '$$');
        mes = converter.makeHtml(mes);

        mes = mes.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
            // Firefox creates extra newlines from <br>s in code blocks, so we replace them before converting newlines to <br>s.
            return match.replace(/\n/gm, '\u0000');
        });
        mes = mes.replace(/\u0000/g, '\n'); // Restore converted newlines
        mes = mes.trim();

        mes = mes.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
            return match.replace(/&amp;/g, '&');
        });

        mes = MessageFormatter.runStage(MessageFormatter.stage.AFTER_MARKDOWN, mes, input.context);
    }

    if (!power_user.allow_name2_display && ch_name && !isUser && !isSystem) {
        mes = mes.replace(new RegExp(`(^|\n)${escapeRegex(ch_name)}:`, 'g'), '$1');
    }

    /** @type {DOMPurify.Config} */
    const config = {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
        MESSAGE_SANITIZE: true,
        ADD_TAGS: ['custom-style'],
        ...sanitizerOverrides,
    };
    mes = encodeStyleTags(mes);
    mes = DOMPurify.sanitize(mes, config);
    mes = decodeStyleTags(mes, { prefix: '.mes_text ' });

    return mes;
}

function getMessageFormattingSpans(text) {
    /** @type {Array<[number, number]>} */
    const spans = [];
    /** @param {RegExp} regex */
    const add = regex => {
        for (const match of text.matchAll(regex)) {
            if (match[0].includes('\n')) spans.push([match.index, match.index + match[0].length]);
        }
    };
    if (power_user.auto_fix_generated_markdown) add(MARKDOWN_FIX_PAIRS);
    if (!power_user.encode_tags) add(MESSAGE_TAG_QUOTES);
    add(MESSAGE_QUOTES);
    // Only the first occurrence of a reasoning string is escaped.
    for (const reasoningString of [power_user.reasoning.prefix, power_user.reasoning.suffix]) {
        const first = reasoningString?.trim() ? text.indexOf(reasoningString) : -1;
        if (first !== -1) spans.push([first, text.lastIndexOf(reasoningString) + reasoningString.length]);
    }
    return spans;
}

export function createStreamingMessageFormatter() {
    /** @type {string | null} */
    let lastMes = null;
    /** @type {string[]} */
    let lastBlocks = [];
    /** @type {Map<string, string>} */
    let held = new Map();
    return (mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) => {
        if (mes === lastMes) {
            return lastBlocks;
        }
        const input = prepareMessageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides, isReasoning);
        const text = input?.regex ? getRegexedString(input.text, input.regex.placement, input.regex.params) : input?.text;
        const blocks = !input ? []
            : MessageFormatter.hasHooks(MessageFormatter.stage.AFTER_REGEX) || MessageFormatter.hasHooks(MessageFormatter.stage.AFTER_MARKDOWN)
                ? [text]
                : splitMessageBlocks(text, getMessageFormattingSpans(text));
        /** @type {Map<string, string>} */
        const next = new Map();
        lastBlocks = blocks.map(block => {
            const html = held.get(block) ?? finishMessageFormatting(input, block);
            next.set(block, html);
            return html;
        });
        held = next;
        lastMes = mes;
        return lastBlocks;
    };
}

export function createStreamingMesTextWriter() {
    const format = createStreamingMessageFormatter();
    const content = createBlockContent();
    return (messageId, text) => {
        const element = chatSurface.getMessageElement(messageId);
        if (!element) {
            return;
        }
        const { name, is_system, is_user } = chat[messageId];
        writeStreamingMesText(element, content, format(text, name, is_system, is_user, messageId), {
            fadeIn: power_user.stream_fade_in,
        });
    };
}

export function balanceStreamingMarkup(text) {
    for (const mark of ['*', '"', '```', '~~~']) {
        if (isOdd(countOccurrences(text, mark))) {
            text = text.trimEnd() + (mark.length > 1 ? '\n' : '') + mark;
        }
    }
    return text;
}

export function createModelIcon(apiName, modelName = '') {
    const image = new Image();
    image.classList.add('icon-svg');
    image.src = `/img/${apiName}.svg`;
    image.title = modelName ? `${apiName} - ${modelName}` : apiName;
    return image;
}

function insertSVGIcon(mes, extra) {
    const apiName = extra?.api || '';

    if (!apiName) {
        return;
    }

    const insertOrReplaceSVG = (image, className, targetSelector, insertBefore) => {
        image.onload = async function () {
            let existingSVG = insertBefore ? mes.find(targetSelector).prev(`.${className}`) : mes.find(targetSelector).next(`.${className}`);
            if (existingSVG.length) {
                existingSVG.replaceWith(image);
            } else {
                if (insertBefore) mes.find(targetSelector).before(image);
                else mes.find(targetSelector).after(image);
            }
            await SVGInject(image);
        };
    };

    const insertIcon = (className, targetSelector, insertBefore) => {
        const image = createModelIcon(apiName, extra?.model);
        image.classList.add(className);
        insertOrReplaceSVG(image, className, targetSelector, insertBefore);
    };

    insertIcon('timestamp-icon', '.timestamp');
    insertIcon('thinking-icon', '.mes_reasoning_header_title', true);
}

export function updateMessageBlock(messageId, message, { rerenderMessage = true } = {}) {
    const messageElement = chatElement.find(`[mesid="${messageId}"]`);
    if (messageElement.length === 0) {
        return;
    }
    if (rerenderMessage) {
        replaceMesTextHtmlWithRuntimePolicy(
            /** @type {HTMLElement} */ (messageElement[0]),
            getMessageTextHTML(message, { messageId }),
        );
    }

    const { tokenRate } = formatGenerationTimer(message.gen_started, message.gen_finished, message.extra?.token_count);
    updateMessageGenerationInfo(messageElement[0], message, tokenRate);
    updateReasoningUI(messageElement);

    appendMediaToMessage(message, messageElement);
}

export function ensureMessageMediaIsArray(mes) {
    /**
     * Determines if a property of an object is a plain property (not a getter/setter or non-enumerable).
     * @param {object} obj Object to check
     * @param {string} name Property name
     * @returns {boolean} True if the property is a plain property, false otherwise
     */
    function isPlainObjectProperty(obj, name) {
        const hasProperty = Object.hasOwn(obj, name);
        if (hasProperty) {
            const descriptor = Object.getOwnPropertyDescriptor(obj, name);
            return descriptor && descriptor.enumerable && descriptor.configurable && descriptor.writable;
        }
        return false;
    }

    /**
     * Determines if a property of an object is a getter (not a plain property).
     * @param {object} obj Object to check
     * @param {string} name Property name
     * @returns {boolean} True if the property is a getter, false otherwise
     */
    function isGetterObjectProperty(obj, name) {
        const hasProperty = Object.hasOwn(obj, name);
        if (hasProperty) {
            const descriptor = Object.getOwnPropertyDescriptor(obj, name);
            return descriptor && typeof descriptor.get === 'function';
        }
        return false;
    }

    /**
     * Adds a plain property to an object that wraps around an array property.
     * @param {object} obj Object to add property to
     * @param {string} plainProperty Plain property name
     * @param {string} arrayProperty Array property to back the plain property
     * @param {(value: any) => boolean} [filterFn] Optional filter function to apply when getting/setting the plain property
     * @param {(value: any) => any} [mapFn] Optional map function to apply when getting/setting the plain property
     */
    function addArrayAutoWrapper(obj, plainProperty, arrayProperty, filterFn = () => true, mapFn = (t) => t) {
        // If the plain property is already a getter, do nothing.
        const hasGetterProperty = isGetterObjectProperty(obj, plainProperty);
        if (hasGetterProperty) {
            return;
        }

        // Define the plain property as a getter/setter that wraps around the array property.
        Object.defineProperty(obj, plainProperty, {
            // Getting the plain property returns the first item in the array property, or undefined if the array is empty.
            get: function () {
                console.trace(`Attempting to GET an array-wrapped property '${plainProperty}'. Use the array property '${arrayProperty}' instead.`);
                const array = Array.isArray(this[arrayProperty]) ? this[arrayProperty].filter(filterFn).map(mapFn) : [];
                return array.length > 0 ? array[0] : void 0;
            },
            // Setting the plain property is not supported, as it would be ambiguous.
            set: function () {
                console.trace(`Attempting to SET an array-wrapped property '${plainProperty}'. Use the array property '${arrayProperty}' instead.`);
            },
            // Exclude the property from JSON serialization and from being listed in for...in loops.
            enumerable: false,
            // Make the property non-configurable to prevent deletion or redefinition.
            configurable: false,
        });
    }

    /**
     * Migrates image swipes from a single image property to an array.
     * @param {ChatMessageExtra} obj
     */
    function migrateMediaToArray(obj) {
        if (isPlainObjectProperty(obj, 'file')) {
            if (!Array.isArray(obj.files)) {
                obj.files = [];
            }
            const fileValue = obj.file;
            delete obj.file;
            if (fileValue) {
                obj.files.push(fileValue);
            }
        }

        if (Array.isArray(obj.image_swipes)) {
            if (!Array.isArray(obj.media)) {
                obj.media = [];
            }
            for (const swipe of obj.image_swipes) {
                if (swipe && typeof swipe === 'string') {
                    obj.media_display = MEDIA_DISPLAY.GALLERY;
                    obj.media.push({ type: MEDIA_TYPE.IMAGE, url: swipe });
                }
            }
            delete obj.image_swipes;
        }

        if (isPlainObjectProperty(obj, 'image')) {
            if (!Array.isArray(obj.media)) {
                obj.media = [];
            }
            const imageValue = obj.image;
            delete obj.image;
            if (imageValue && typeof imageValue === 'string') {
                obj.media.push({ type: MEDIA_TYPE.IMAGE, url: imageValue });
            }
            if (obj.media_display === MEDIA_DISPLAY.GALLERY) {
                const selectedIndex = obj.media.findIndex(t => t.url === imageValue);
                if (selectedIndex > -1) {
                    obj.media_index = selectedIndex;
                }
            }
            obj.media = obj.media.filter((v, i, a) => i === a.findIndex(t => t.url === v.url));
        }

        if (isPlainObjectProperty(obj, 'video')) {
            if (!Array.isArray(obj.media)) {
                obj.media = [];
            }
            const videoValue = obj.video;
            delete obj.video;
            if (videoValue && typeof videoValue === 'string') {
                obj.media.push({ type: MEDIA_TYPE.VIDEO, url: videoValue });
            }
        }
    }

    if (!mes || !mes.extra || typeof mes.extra !== 'object') {
        return;
    }

    migrateMediaToArray(mes.extra);
    addArrayAutoWrapper(mes.extra, 'file', 'files');
    addArrayAutoWrapper(mes.extra, 'image', 'media', (t) => t.type === MEDIA_TYPE.IMAGE, (t) => t.url);
    addArrayAutoWrapper(mes.extra, 'video', 'media', (t) => t.type === MEDIA_TYPE.VIDEO, (t) => t.url);
}

export function getMediaDisplay(mes) {
    const value = mes?.extra?.media_display || power_user.media_display || MEDIA_DISPLAY.LIST;
    return Object.values(MEDIA_DISPLAY).includes(value) ? value : MEDIA_DISPLAY.LIST;
}

export function getMediaIndex(mes) {
    if (!Array.isArray(mes?.extra?.media)) {
        return 0;
    }
    const value = mes.extra?.media_index;
    if (isNaN(value) || value < 0 || value >= mes.extra.media.length) {
        return 0;
    }
    return value;
}

export function appendMediaToMessage(mes, messageElement, scrollBehavior = SCROLL_BEHAVIOR.ADJUST) {
    ensureMessageMediaIsArray(mes);

    const fileWrapper = messageElement.find('.mes_file_wrapper');
    const mediaWrapper = messageElement.find('.mes_media_wrapper');

    const hasMedia = Array.isArray(mes?.extra?.media) && mes.extra.media.length > 0;
    const hasFiles = Array.isArray(mes?.extra?.files) && mes.extra.files.length > 0;
    const mediaDisplay = hasMedia ? getMediaDisplay(mes) : null;
    const hideMessageText = hasMedia && mes?.extra?.inline_image === false;

    const mediaBlocks = [];
    const mediaPromises = [];

    const chatHeight = (hasMedia || hasFiles) ? getChatScrollHeight() : 0;
    const scrollPosition = (hasMedia || hasFiles) ? getChatScrollTop() : 0;
    const doAdjustScroll = () => {
        if (!hasMedia && !hasFiles) {
            return;
        }
        if (scrollBehavior === SCROLL_BEHAVIOR.NONE) {
            return;
        }
        if (scrollBehavior === SCROLL_BEHAVIOR.KEEP) {
            setChatScrollTop(scrollPosition);
            return;
        }
        const newChatHeight = getChatScrollHeight();
        const diff = newChatHeight - chatHeight;
        setChatScrollTop(scrollPosition + diff);
    };

    // Set media display attribute
    messageElement.attr('data-media-display', mediaDisplay);
    // Toggle text visibility
    messageElement.find('.mes_text').toggleClass('inline_media', hideMessageText);

    /**
     * Appends a single image attachment to the message element.
     * @param {MediaAttachment} attachment Image attachment object
     * @param {number} index Index of the image attachment
     * @returns {JQuery<HTMLElement>} The appended image container element
     */
    function appendImageAttachment(attachment, index) {
        const template = $('#message_image_template .mes_img_container').clone();
        template.attr('data-index', index);

        const image = template.find('.mes_img');
        image.attr('src', attachment.url);
        image.attr('title', attachment.title || mes.extra.title || '');
        mediaPromises.push(new Promise((resolve) => {
            function onLoad() {
                image.removeAttr('alt');
                image.removeClass('error');
                resolve();
            }
            function onError() {
                image.attr('alt', '');
                image.addClass('error');
                resolve();
            }
            if (image.prop('complete')) {
                onLoad();
            } else {
                image.off('load').on('load', onLoad);
                image.off('error').on('error', onError);
            }
        }));

        mediaBlocks.push(template);
        return template;
    }

    /**
     * Appends a single video attachment to the message element.
     * @param {MediaAttachment} attachment Video attachment object
     * @param {number} index Index of the video attachment
     * @returns {JQuery<HTMLElement>} The appended video container element
     */
    function appendVideoAttachment(attachment, index) {
        const template = $('#message_video_template .mes_video_container').clone();
        template.attr('data-index', index);

        const video = template.find('.mes_video');
        video.attr('src', attachment.url);
        video.attr('title', attachment.title || mes.extra.title || '');
        mediaPromises.push(new Promise((resolve) => {
            function onLoad() {
                resolve();
            }
            function onError() {
                video.addClass('error');
                resolve();
            }
            if (video.prop('readyState') >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                onLoad();
            } else {
                video.off('loadeddata').on('loadeddata', onLoad);
                video.off('error').on('error', onError);
            }
        }));

        mediaBlocks.push(template);
        return template;
    }

    /**
     * Appends a single audio attachment to the message element.
     * @param {MediaAttachment} attachment Audio attachment object
     * @param {number} index Index of the audio attachment
     * @returns {JQuery<HTMLElement>} The appended audio container element
     */
    function appendAudioAttachment(attachment, index) {
        const template = $('#message_audio_template .mes_audio_container').clone();
        template.attr('data-index', index);
        const audio = template.find('.mes_audio');
        audio.attr('src', attachment.url);
        audio.attr('title', attachment.title || mes.extra.title || '');

        mediaPromises.push(new Promise((resolve) => {
            function onLoad() {
                resolve();
            }
            function onError() {
                audio.addClass('error');
                resolve();
            }
            if (audio.prop('readyState') >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                onLoad();
            } else {
                audio.off('loadeddata').on('loadeddata', onLoad);
                audio.off('error').on('error', onError);
            }
        }));

        new AudioPlayer(audio.get(0), template.get(0));

        mediaBlocks.push(template);
        return template;
    }

    /**
     * Appends a media attachment to the message element.
     * @param {MediaAttachment} attachment Media attachment object
     * @param {number} index Index of the media attachment
     * @returns {JQuery<HTMLElement>} The appended media container element
     */
    function appendMediaAttachment(attachment, index) {
        if (!attachment.type) {
            attachment.type = MEDIA_TYPE.IMAGE;
        }
        switch (attachment.type) {
            case MEDIA_TYPE.IMAGE:
                return appendImageAttachment(attachment, index);
            case MEDIA_TYPE.VIDEO:
                return appendVideoAttachment(attachment, index);
            case MEDIA_TYPE.AUDIO:
                return appendAudioAttachment(attachment, index);
        }

        console.warn(`Unknown media type: ${attachment.type}, defaulting to image.`, attachment);
        return appendImageAttachment(attachment, index);
    }

    /**
     * Saves the current playback times of media elements in the message.
     * @returns {Map<string, MediaState>} Media playback times by source URL
     */
    function saveMediaStates() {
        const states = new Map();
        const media = mediaWrapper.find('video, audio');
        media.each((_, element) => {
            if (element instanceof HTMLMediaElement) {
                if (!element.currentSrc || element.readyState === HTMLMediaElement.HAVE_NOTHING) {
                    return;
                }
                const state = { currentTime: element.currentTime, paused: element.paused };
                states.set(element.currentSrc, state);
            }
        });
        return states;
    }

    /**
     * Restores the playback times of media elements in the message.
     * @param {Map<string, MediaState>} states Media playback times by source URL
     */
    function restoreMediaStates(states) {
        const media = mediaWrapper.find('video, audio');
        media.each((_, element) => {
            if (element instanceof HTMLMediaElement) {
                const restoreState = () => {
                    if (!states.has(element.currentSrc)) {
                        return;
                    }
                    const state = states.get(element.currentSrc);
                    element.currentTime = state.currentTime;
                    if (!state.paused) {
                        element.play();
                    }
                };
                if (element.readyState < HTMLMediaElement.HAVE_METADATA) {
                    element.addEventListener('loadedmetadata', () => restoreState(), { once: true });
                } else {
                    restoreState();
                }
            }
        });
    }

    // Add media gallery to message
    if (hasMedia && mediaDisplay === MEDIA_DISPLAY.GALLERY) {
        const mediaIndex = getMediaIndex(mes);
        const selectedMedia = mes.extra.media[mediaIndex];

        const galleryControls = $('#message_gallery_controls .mes_img_swipes').clone();
        const counter = galleryControls.find('.mes_img_swipe_counter');
        counter.text(`${mediaIndex + 1}/${mes.extra.media.length}`);

        const template = appendMediaAttachment(selectedMedia, mediaIndex);
        template.addClass('img_swipes');
        template.append(galleryControls);
    }

    // Add media as a list to message
    if (hasMedia && mediaDisplay === MEDIA_DISPLAY.LIST) {
        for (let index = 0; index < mes.extra.media.length; index++) {
            const attachment = mes.extra.media[index];
            appendMediaAttachment(attachment, index);
        }
    }

    // Remove existing file containers
    fileWrapper.empty();

    // Add files to message
    if (hasFiles) {
        for (let index = 0; index < mes.extra.files.length; index++) {
            const file = mes.extra.files[index];
            const template = $('#message_file_template .mes_file_container').clone();
            template.attr('data-index', index);
            template.find('.mes_file_name').text(file.name).attr('title', file.name);
            template.find('.mes_file_size').text(humanFileSize(file.size)).attr('title', file.size);
            fileWrapper.append(template);
        }
    }

    // Early return if no media
    if (!hasMedia) {
        mediaWrapper.empty();
        doAdjustScroll();
        return;
    }

    // TODO: Consider making this awaitable
    Promise.race([Promise.all(mediaPromises), delay(debounce_timeout.short)]).then(() => {
        const states = saveMediaStates();
        mediaWrapper.empty().append(mediaBlocks);
        restoreMediaStates(states);
        doAdjustScroll();
    });
}

export function addCopyToCodeBlocks(messageElement) {
    const coordinator = getCodeHighlightCoordinator();
    const codeBlocks = $(messageElement).find('pre code');
    for (let i = 0; i < codeBlocks.length; i++) {
        const codeBlock = codeBlocks.get(i);
        if (!codeBlock || !(codeBlock instanceof HTMLElement)) {
            continue;
        }

        if (codeBlock.querySelector('.code-copy')) {
            continue;
        }

        const ensureCopyButton = () => {
            if (codeBlock.querySelector('.code-copy')) {
                return;
            }

            const copyButton = document.createElement('i');
            copyButton.classList.add('fa-solid', 'fa-copy', 'code-copy', 'interactable');
            copyButton.title = t`Copy code`;
            copyButton.dataset.i18n = '[title]Copy code';
            codeBlock.appendChild(copyButton);
            copyButton.addEventListener('click', async function (e) {
                e.stopPropagation();
                const text = codeBlock.textContent;
                await copyText(text);
                toastr.info(t`Copied!`, '', { timeOut: 2000 });
            });
        };

        if (codeBlock.classList.contains('hljs') || codeBlock.dataset.ttHljsState === 'done') {
            ensureCopyButton();
            continue;
        }

        coordinator.request(codeBlock, { afterHighlight: ensureCopyButton });
    }
}

function updateMessageItemizedPromptButton(message, { messageId = chat.indexOf(message), messageElement = chatElement.find(`.mes[mesid="${messageId}"]`) }) {
    if (!message.is_user && hasItemizedPromptForMessage(messageId)) {
        messageElement.find('.mes_prompt').show();
    }
}

function getToolMessageHTML(message, messageId) {
    if (message.role !== 'tool') {
        return null;
    }

    for (let index = messageId - 1; index >= 0; index--) {
        const calls = chat[index]?.tool_calls;
        const call = Array.isArray(calls) && calls.find(call => call.id === message.tool_call_id);
        if (call) {
            return ToolManager.formatToolInvocationMessage([{
                ...call,
                result: message.extra?.display_text ?? message.mes,
            }]);
        }
    }
    return null;
}

function getMessageFormattingArgs(message, messageId) {
    const isToolFloor = message.is_system === true
        && message.is_user !== true
        && Array.isArray(message.extra?.tool_invocations);
    const text = isToolFloor
        ? ToolManager.formatToolInvocationMessage(readLegacyToolInvocations(message, messageId).invocations)
        : (message.extra?.display_text || message.mes);
    return [
        text,
        isToolFloor ? systemUserName : message.name,
        isToolFloor || message.is_system,
        message.is_user,
        messageId,
        message.extra?.uses_system_ui ? { MESSAGE_ALLOW_SYSTEM_UI: true } : {},
    ];
}

function getMessageTextHTML(message, { messageId = chat.indexOf(message) }) {
    return getToolMessageHTML(message, messageId)
        ?? messageFormatting(...getMessageFormattingArgs(message, messageId));
}

async function prepareMessageContent({ messages, messageIds }) {
    const entries = messageIds.map(messageId => {
        const message = messages[messageId];
        const html = getToolMessageHTML(message, messageId);
        const input = html === null ? prepareMessageFormatting(...getMessageFormattingArgs(message, messageId)) : null;
        return { messageId, html, input };
    });
    const requests = entries.filter(entry => entry.input?.regex)
        .map(({ input }) => ({ rawString: input.text, ...input.regex }));
    const texts = await getRegexedStringBatchAsync(requests);
    const results = new Map();
    let regexIndex = 0;
    let start = performance.now();
    for (const { messageId, html, input } of entries) {
        results.set(messageId, {
            messageHtml: html ?? finishMessageFormatting(input, input?.regex ? texts[regexIndex++] : input?.text),
        });
        if (performance.now() - start > 8) {
            await delay(0);
            start = performance.now();
        }
    }
    return results;
}

const pendingToolInvocations = new WeakMap();

function refreshToolCallUI(ownerMessage) {
    const ownerId = chat.indexOf(ownerMessage);
    const element = ownerId >= 0 ? chatSurface.getMessageElement(ownerId) : null;
    if (element instanceof HTMLElement) {
        try {
            updateToolCallUI($(element), ownerId);
        } catch (error) {
            console.error('Failed to refresh pending tool calls:', error);
        }
    }
}

function showPendingToolCalls(ownerMessage, calls) {
    pendingToolInvocations.set(ownerMessage, calls.map(call => ({ ...call })));
    refreshToolCallUI(ownerMessage);
}

function completePendingToolCall(ownerMessage, invocation) {
    const call = pendingToolInvocations.get(ownerMessage)?.find(call => call.id === invocation.id);
    if (!call) {
        console.error(`Pending tool call "${invocation.id}" is missing`);
        return;
    }
    Object.assign(call, { result: invocation.result, error: invocation.error === true });
    refreshToolCallUI(ownerMessage);
}

function clearPendingToolCalls(ownerMessage) {
    if (pendingToolInvocations.delete(ownerMessage)) {
        refreshToolCallUI(ownerMessage);
    }
}

function handleToolInvocationError(ownerMessage, error) {
    clearPendingToolCalls(ownerMessage);
    if (error instanceof LegacyMcpOutcomeUnknownError) {
        toastr.warning(
            `One or more tools in this batch may have executed, but an MCP result is unknown. TauriTavern did not retry or save a partial tool turn. Check the MCP server and affected systems before trying again.\n\n${error.message}`,
            'MCP tool result unknown',
            { timeOut: 0, extendedTimeOut: 0, closeButton: true },
        );
    }
}

function updateToolCallUI(messageElement, messageId) {
    const host = /** @type {HTMLElement & { __ttToolProjectionHtml?: string }} */ (messageElement.find('.mes_tool_calls')[0]);
    if (!(host instanceof HTMLElement)) {
        throw new Error(`Message ${messageId} is missing its tool-call projection host`);
    }

    const invocations = pendingToolInvocations.get(chat[messageId]) ?? [];
    const html = invocations.length > 0 ? ToolManager.formatToolInvocationMessage(invocations) : '';
    if (host.__ttToolProjectionHtml !== html) {
        host.innerHTML = html;
        host.__ttToolProjectionHtml = html;
    }
    host.hidden = invocations.length === 0;
    host.setAttribute('aria-busy', invocations.length > 0 ? 'true' : 'false');
}

export function addOneMessage(mes, { type = undefined, insertAfter = null, scroll = true, insertBefore = null, forceId = null, showSwipes = true, transient = false } = {}) {
    // Callers push the new message to chat before calling addOneMessage
    const messageId = (() => {
        if (typeof forceId === 'number') {
            return forceId;
        }
        if (typeof insertBefore === 'number') {
            return insertBefore - 1;
        }
        if (typeof insertAfter === 'number') {
            return insertAfter + 1;
        }
        const index = chat.indexOf(mes);
        if (index !== -1) {
            return index;
        }
        return chat.length - 1;
    })();

    let messageElement;

    if (type === 'swipe') {
        // Forbidden black magic
        // This allows to use "continue" on user messages
        mes.swipe_id ??= 0;
        mes.swipes ??= [mes.mes];
        //This keeps listeners intact.
        messageElement = chatElement.find(`[mesid="${messageId}"]`);
        updateMessageElement(mes, { messageId, messageElement, adjustMediaScroll: scroll ? SCROLL_BEHAVIOR.ADJUST : SCROLL_BEHAVIOR.NONE, transient });
    } else {
        reconcileMountedChatSurface({
            includeMessageIds: [messageId],
            materializeOptionsByMessageId: new Map([[
                messageId,
                { adjustMediaScroll: scroll ? SCROLL_BEHAVIOR.ADJUST : SCROLL_BEHAVIOR.NONE, transient },
            ]]),
        });
        messageElement = $(chatSurface.getMessageElement(messageId));
    }

    if (showSwipes) refreshActiveSwipeButtons([messageId]);
    // Don't scroll if not inserting last
    if (!insertAfter && !insertBefore && scroll) {
        scrollChatToBottom({ waitForFrame: true });
    }

    applyCharacterTagsToMessageDivs({ mesIds: messageId });
    updateEditArrowClasses();
    return messageElement;
}

export function updateMessageElement(mes, { messageId = chat.length - 1, messageElement = messageTemplate.clone(), adjustMediaScroll = SCROLL_BEHAVIOR.NONE, frontendSourceHandoffEvent = null, messageHtml, transient = false } = {}) {
    let avatarImg = getThumbnailUrl('persona', user_avatar);

    //for non-user messages
    if (!mes.is_user) {
        if (mes.force_avatar) {
            avatarImg = mes.force_avatar;
        } else if (this_chid === undefined) {
            avatarImg = system_avatar;
        } else if (characters[this_chid] && characters[this_chid].avatar !== 'none') {
            avatarImg = getThumbnailUrl('avatar', characters[this_chid].avatar);
        } else {
            avatarImg = default_avatar;
        }
        //old processing:
        //if message is from system, use the name provided in the message JSONL to proceed,
        //if not system message, use name2 (char's name) to proceed
        //characterName = mes.is_system || mes.force_avatar ? mes.name : name2;
    } else if (mes.is_user && mes.force_avatar) {
        // Special case for persona images.
        avatarImg = mes.force_avatar;
    }
    const momentDate = timestampToMoment(mes.send_date);
    const timestamp = momentDate.isValid() ? momentDate.format('LL LT') : '';
    const messageHTML = messageHtml ?? getMessageTextHTML(mes, { messageId });
    const bookmarkLink = mes?.extra?.bookmark_link;
    const tokenCount = mes.extra?.token_count;
    const { timerValue, timerTitle, tokenRate } = formatGenerationTimer(mes.gen_started, mes.gen_finished, mes.extra?.token_count, mes.extra?.reasoning_duration, mes.extra?.time_to_first_token);

    messageElement.attr({
        'mesid': messageId,
        'swipeid': mes.swipe_id ?? 0,
        'ch_name': mes.name,
        'is_user': mes.is_user,
        'is_system': !!mes.is_system,
        'bookmark_link': bookmarkLink,
        'force_avatar': !!mes.force_avatar,
        'timestamp': timestamp,
        // ...(type ?? { type }),
        'type': mes.extra?.type ?? '',
    });

    messageElement.find('.avatar img').attr('src', avatarImg);
    messageElement.find('.ch_name .name_text').text(mes.name);
    messageElement.find('.timestamp').text(timestamp).attr('title', `${mes.extra?.api ? mes.extra.api + ' - ' : ''}${mes.extra?.model ?? ''}`);
    messageElement.find('.mesIDDisplay').text(`#${messageId}`);
    const root = messageElement[0];
    const author = root.querySelector('.name_text');
    const number = root.querySelector('.mesIDDisplay');
    setAriaRelation(root, 'labelledby', author, number);
    const actions = root.querySelector('.extraMesButtons');
    setAriaRelation(root.querySelector('.extraMesButtonsHint'), 'controls', actions);
    setAriaRelation(root.querySelector('.del_checkbox'), 'describedby', author, number);
    tokenCount && messageElement.find('.tokenCounterDisplay').text(`${tokenCount}t`);
    mes.title && messageElement.attr('title', mes.title);
    timerValue && messageElement.find('.mes_timer').attr('title', timerTitle).text(timerValue);
    updateMessageGenerationInfo(messageElement[0], mes, tokenRate);
    bookmarkLink && updateBookmarkDisplay(messageElement);

    if (mes.extra?.bias !== '') {
        const bias = messageFormatting(mes.extra?.bias, '', false, false, -1, {}, false);
        messageElement.find('.mes_bias').html(bias);
    }

    updateReasoningUI(messageElement);
    updateToolCallUI(messageElement, messageId);

    if (power_user.timestamp_model_icon && mes.extra?.api) {
        insertSVGIcon(messageElement, mes.extra);
    }

    messageElement.toggleClass('smallSysMes', mes?.extra?.isSmallSys === true || mes.role === 'tool');
    messageElement.toggleClass('toolCall', mes.role === 'tool' || Array.isArray(mes?.extra?.tool_invocations));
    messageElement.attr('data-message-role', mes.role === 'tool' ? 'tool' : null);

    updateMessageItemizedPromptButton(mes, { messageId, messageElement });

    messageElement.find('.avatar img').on('error', function () {
        $(this).hide();
        $(this).parent().html('<div class="missing-avatar fa-solid fa-user-slash"></div>');
    });

    appendMediaToMessage(mes, messageElement, adjustMediaScroll);
    const replaceContent = transient ? replaceTransientMesTextHtmlWithRuntimePolicy : replaceMesTextHtmlWithRuntimePolicy;
    replaceContent(
        /** @type {HTMLElement} */ (messageElement[0]),
        messageHTML,
        { frontendSourceHandoffEvent },
    );
    // Set the swipes counter for all non-user messages.
    if (!mes.is_user && mes.role !== 'tool') {
        updateSwipeCounter(messageId, { message: mes, messageElement });
    }

    return messageElement;
}

export function getCharacterAvatar(characterId) {
    const character = characters[characterId];
    const avatarImg = character?.avatar;

    if (!avatarImg || avatarImg === 'none') {
        return default_avatar;
    }

    return formatCharacterAvatar(avatarImg);
}

export function formatCharacterAvatar(characterAvatar) {
    return `characters/${characterAvatar}`;
}

function shouldCountMessageTokens() {
    return power_user.message_token_count_enabled || power_user.message_token_rate_enabled;
}

let requestId = null;

export function scrollChatToBottom({ waitForFrame } = {}) {
    if (!power_user.auto_scroll_chat_to_bottom) {
        return;
    }

    const doScroll = () => {
        let position = getChatScrollHeight();

        if (power_user.waifuMode) {
            const lastMessage = chatElement.find('.mes.last_mes');
            if (lastMessage.length) {
                const lastMessagePosition = lastMessage.position().top;
                position = getChatScrollTop() + lastMessagePosition;
            }
        }

        setChatScrollTop(position);
        requestId = null;
    };

    // Do not check truthiness. requestId can loop to zero.
    if (requestId !== null) {
        cancelAnimationFrame(requestId);
    }

    if (!waitForFrame) {
        doScroll();
        return;
    }

    // This prevents layout thrashing.
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#return_value
    // https://gist.github.com/paulirish/5d52fb081b3570c81e3a#file-what-forces-layout-md
    requestId = requestAnimationFrame(() => doScroll());
}

export function substituteParamsExtended(content, additionalMacro = {}, postProcessFn = (x) => x) {
    return substituteParams(content, { dynamicMacros: additionalMacro, postProcessFn });
}

export function substituteParamsLegacy(content, _name1, _name2, _original, _group, _replaceCharacterCard = true, additionalMacro = {}, postProcessFn = (x) => x) {
    return substituteParams(content, {
        name1Override: _name1, name2Override: _name2, original: _original, groupOverride: _group,
        replaceCharacterCard: _replaceCharacterCard, dynamicMacros: additionalMacro, postProcessFn,
    });
}

function suggestExperimentalMacroEngine(content) {
    // Try to roughly detect experimental macro features to show the onboarding if needed.
    // This does not have to be 100% accurate, only best effort what we can quickly check.
    // Only do this if the warning wasn't shown yet, to prevent needless regex checks.
    if (accountStorage.getItem('slash_command_experimental_engine_warning_shown') !== 'true') {
        let feature = /** @type {string|null} */ (null);
        if (/{{\s*if/.test(content)) feature = '{{if}} macro';
        else if (/{{\s*\//.test(content)) feature = 'scoped macro';
        else if (/{{\s*[!?~#/]/.test(content)) feature = 'macro flags';
        else if (/{{\s*[.$]/.test(content)) feature = 'variable shorthands';
        else if (/\{\{(?:(?!\}\}).)*\{\{(?=[\s\S]*?\}\}[\s\S]*?\}\})/.test(content)) feature = 'nested macro';
        else if (/{{(?:greeting|charFirstMessage)(?:::\d+)?}}/i.test(content)) feature = 'greeting macro';

        if (feature) void onboardingExperimentalMacroEngine(feature);
    }

}

export function substituteParams(content, options = {}) {
    if (!content) return '';
    if (typeof content !== 'string') {
        console.warn('substituteParams: content will be coerced to string', content);
        content = String(content);
    }
    const isOptionsObject = options && typeof options === 'object' && !Array.isArray(options);
    // An omitted user override is still a positional call when later arguments exist.
    if (!isOptionsObject || (arguments.length > 2 && arguments[1] === undefined)) {
        return substituteParamsLegacy.call(this, ...arguments);
    }
    const env = MacroEnvBuilder.buildFromRawEnv({
        ...options, content, replaceCharacterCard: options.replaceCharacterCard ?? true,
    }, power_user.experimental_macro_engine ? 'new' : 'legacy');
    if (env.engine === 'legacy') suggestExperimentalMacroEngine(content);
    return evaluateMacroEnv(content, env);
}

export function getStoppingStrings(isImpersonate, isContinue, api = main_api) {
    // Only custom stop strings apply to Chat Completion
    if (api === 'openai') {
        return getCustomStoppingStrings();
    }

    const result = [];

    if (power_user.context.names_as_stop_strings) {
        const charString = `\n${name2}:`;
        const userString = `\n${name1}:`;
        result.push(isImpersonate ? charString : userString);

        result.push(userString);

        if (isContinue && Array.isArray(chat) && chat[chat.length - 1]?.is_user) {
            result.push(charString);
        }

        // Add group members as stopping strings if generating for a specific group member or user. (Allow slash commands to work around name stopping string restrictions)
        if (selected_group && (name2 || isImpersonate)) {
            const group = groups.find(x => x.id === selected_group);

            if (group && Array.isArray(group.members)) {
                const names = group.members
                    .map(x => characters.find(y => y.avatar == x))
                    .filter(x => x && x.name && x.name !== name2)
                    .map(x => `\n${x.name}:`);
                result.push(...names);
            }
        }
    }

    result.push(...getInstructStoppingSequences());
    result.push(...getCustomStoppingStrings());

    if (power_user.single_line) {
        result.unshift('\n');
    }

    return result.filter(x => x).filter(onlyUnique);
}

export async function generateQuietPrompt({ quietPrompt = '', quietToLoud = false, skipWIAN = false, quietImage = null, quietName = null, responseLength = null, forceChId = null, jsonSchema = null, removeReasoning = true, trimToSentence = false } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('generateQuietPrompt called with positional arguments. Please use an object instead.');
        [quietPrompt, quietToLoud, skipWIAN, quietImage, quietName, responseLength, forceChId, jsonSchema] = arguments;
    }

    const responseLengthCustomized = typeof responseLength === 'number' && responseLength > 0;
    let eventHook = () => { };
    try {
        /** @type {GenerateOptions} */
        const generateOptions = {
            quiet_prompt: quietPrompt ?? '',
            quietToLoud: quietToLoud ?? false,
            skipWIAN: skipWIAN ?? false,
            force_name2: true,
            quietImage: quietImage ?? null,
            quietName: quietName ?? null,
            force_chid: forceChId ?? null,
            jsonSchema: jsonSchema ?? null,
        };
        if (responseLengthCustomized) {
            TempResponseLength.save(main_api, responseLength);
            eventHook = TempResponseLength.setupEventHook(main_api);
        }
        let result = await Generate('quiet', generateOptions);
        result = trimToSentence ? trimToEndSentence(result) : result;
        result = removeReasoning ? removeReasoningFromString(result) : result;
        return result;
    } finally {
        if (responseLengthCustomized && TempResponseLength.isCustomized()) {
            TempResponseLength.restore(main_api);
            TempResponseLength.removeEventHook(main_api, eventHook);
        }
    }
}

export async function processCommands(message) {
    if (!message || !message.trim().startsWith('/')) {
        return false;
    }
    await executeSlashCommandsOnChatInput(message, {
        clearChatInput: true,
    });
    return true;
}

export function extractMessageBias(message) {
    if (!message) {
        return '';
    }

    try {
        const biasHandlebars = Handlebars.create();
        const biasMatches = [];
        biasHandlebars.registerHelper('bias', function (text) {
            biasMatches.push(text);
            return '';
        });
        const template = biasHandlebars.compile(message);
        template({});

        if (biasMatches && biasMatches.length > 0) {
            return ` ${biasMatches.join(' ')}`;
        }

        return '';
    } catch {
        return '';
    }
}

function cleanGroupMessage(getMessage) {
    if (power_user.disable_group_trimming) {
        return getMessage;
    }

    const group = groups.find((x) => x.id == selected_group);

    if (group && Array.isArray(group.members) && group.members) {
        for (let member of group.members) {
            const character = characters.find(x => x.avatar == member);

            if (!character) {
                continue;
            }

            const name = character.name;

            // Skip current speaker.
            if (name === name2) {
                continue;
            }

            const regex = new RegExp(`(^|\n)${escapeRegex(name)}:`);
            const nameMatch = getMessage.match(regex);
            if (nameMatch) {
                getMessage = getMessage.substring(0, nameMatch.index);
            }
        }
    }
    return getMessage;
}

function preparePersonaDescriptionExtensionPrompt() {
    const INJECT_TAG = 'PERSONA_DESCRIPTION';
    setExtensionPrompt(INJECT_TAG, '', extension_prompt_types.IN_PROMPT, 0);

    if (!power_user.persona_description || power_user.persona_description_position === persona_description_positions.NONE) {
        return null;
    }

    const promptPositions = [persona_description_positions.BOTTOM_AN, persona_description_positions.TOP_AN];
    let authorsNote = null;
    if (promptPositions.includes(power_user.persona_description_position) && shouldWIAddPrompt) {
        authorsNote = {
            before: power_user.persona_description_position === persona_description_positions.TOP_AN ? power_user.persona_description : '',
            after: power_user.persona_description_position === persona_description_positions.BOTTOM_AN ? power_user.persona_description : '',
        };
    }

    if (power_user.persona_description_position === persona_description_positions.AT_DEPTH) {
        setExtensionPrompt(INJECT_TAG, power_user.persona_description, extension_prompt_types.IN_CHAT, power_user.persona_description_depth, true, power_user.persona_description_role);
    }
    return authorsNote;
}

export async function getExtensionPromptByName(moduleName) {
    if (!moduleName) {
        return '';
    }

    const prompt = extension_prompts[moduleName];

    if (!prompt) {
        return '';
    }

    const hasFilter = typeof prompt.filter === 'function';

    if (hasFilter && !await prompt.filter()) {
        return '';
    }

    return substituteParams(prompt.value);
}

export function getExtensionPromptMaxDepth() {
    return MAX_INJECTION_DEPTH;
    /*
    const prompts = Object.values(extension_prompts);
    const maxDepth = Math.max(...prompts.map(x => x.depth ?? 0));
    // Clamp to 1 <= depth <= MAX_INJECTION_DEPTH
    return Math.max(Math.min(maxDepth, MAX_INJECTION_DEPTH), 1);
    */
}

export function getInChatInjectionDepths(prompts, depths = []) {
    const maxDepth = getExtensionPromptMaxDepth();
    const usedDepths = new Set(depths);
    for (const prompt of Object.values(prompts ?? {})) {
        if (prompt.position != extension_prompt_types.IN_CHAT || !prompt.value) continue;
        // A prompt without a depth matches every depth.
        if (prompt.depth === undefined) return Array.from({ length: maxDepth + 1 }, (_, depth) => depth);
        usedDepths.add(prompt.depth);
    }
    return [...usedDepths].filter(depth => Number.isInteger(depth) && depth >= 0 && depth <= maxDepth).sort((a, b) => a - b);
}

export async function getExtensionPrompt(position = extension_prompt_types.IN_PROMPT, depth = undefined, separator = '\n', role = undefined, wrap = true) {
    const filterByFunction = async (prompt) => {
        const hasFilter = typeof prompt.filter === 'function';
        if (hasFilter && !await prompt.filter()) {
            return false;
        }
        return true;
    };
    const promptPromises = Object.keys(extension_prompts)
        .sort()
        .map((x) => extension_prompts[x])
        .filter(x => x.position == position && x.value)
        .filter(x => depth === undefined || x.depth === undefined || x.depth === depth)
        .filter(x => role === undefined || x.role === undefined || x.role === role)
        .filter(filterByFunction);
    const prompts = await Promise.all(promptPromises);

    let values = prompts.map(x => x.value.trim()).join(separator);
    if (wrap && values.length && !values.startsWith(separator)) {
        values = separator + values;
    }
    if (wrap && values.length && !values.endsWith(separator)) {
        values = values + separator;
    }
    if (values.length) {
        values = substituteParams(values);
    }
    return values;
}

export function baseChatReplace(value, name1Override = null, name2Override = null) {
    if (typeof value === 'string' && value.length > 0) {
        value = substituteParams(value, { name1Override, name2Override, replaceCharacterCard: false });

        if (power_user.collapse_newlines) {
            value = collapseNewlines(value);
        }

        value = value.replace(/\r/g, '');
    }
    return value;
}

export function createLazyFields(resolvers) {
    const result = /** @type {CharacterCardFields} */ ({});
    for (const [key, resolver] of Object.entries(resolvers)) {
        let cached;
        let resolved = false;
        Object.defineProperty(result, key, {
            get() {
                if (!resolved) {
                    cached = resolver();
                    resolved = true;
                }
                return cached;
            },
            enumerable: true,
            configurable: true,
        });
    }
    return result;
}

export function getCharacterCardFieldsSource({ chid = undefined } = {}) {
    const currentChid = chid ?? this_chid;
    const character = characters[currentChid];
    return {
        persona: power_user.persona_description?.trim() ?? '',
        system: character && power_user.prefer_character_prompt
            ? (chat_metadata.system_prompt || character.data?.system_prompt || '').trim() : '',
        jailbreak: character && power_user.prefer_character_jailbreak
            ? character.data?.post_history_instructions?.trim() ?? '' : '',
        version: character?.data?.character_version ?? '',
        charDepthPrompt: character?.data?.extensions?.depth_prompt?.prompt?.trim() ?? '',
        creatorNotes: character?.data?.creator_notes?.trim() ?? '',
        description: character?.description?.trim() ?? '',
        personality: character?.personality?.trim() ?? '',
        scenario: character ? (chat_metadata.scenario || character.scenario || '').trim() : '',
        mesExamples: character ? (chat_metadata.mes_example || character.mes_example || '').trim() : '',
        firstMessage: character?.first_mes?.trim() ?? '',
        alternateGreetings: Array.isArray(character?.data?.alternate_greetings)
            ? character.data.alternate_greetings.map(value => value?.trim() ?? '') : [],
        groupCards: selected_group && character ? getGroupCharacterCardsSource(selected_group, Number(currentChid)) : null,
    };
}

export function createCharacterCardFields(source, replace = baseChatReplace) {
    const groupCards = getGroupCharacterCardsLazy(null, null, { source: source.groupCards, replace });
    const resolvers = {};
    for (const key of ['system', 'jailbreak', 'persona', 'charDepthPrompt', 'creatorNotes', 'firstMessage']) {
        resolvers[key] = () => replace(source[key]);
    }
    for (const key of ['description', 'personality', 'scenario', 'mesExamples']) {
        resolvers[key] = () => groupCards ? groupCards[key] : replace(source[key]);
    }
    resolvers.version = () => source.version;
    resolvers.alternateGreetings = () => source.alternateGreetings.map(value => replace(value));
    return createLazyFields(resolvers);
}

export function getCharacterCardFieldsLazy({ chid = undefined } = {}) {
    return createCharacterCardFields(getCharacterCardFieldsSource({ chid }));
}

export function getCharacterCardFields({ chid = undefined } = {}) {
    const lazy = getCharacterCardFieldsLazy({ chid });

    // Resolve all lazy fields into a plain object
    return {
        system: lazy.system,
        mesExamples: lazy.mesExamples,
        description: lazy.description,
        personality: lazy.personality,
        persona: lazy.persona,
        scenario: lazy.scenario,
        jailbreak: lazy.jailbreak,
        version: lazy.version,
        charDepthPrompt: lazy.charDepthPrompt,
        creatorNotes: lazy.creatorNotes,
        firstMessage: lazy.firstMessage,
        alternateGreetings: lazy.alternateGreetings,
    };
}

function buildAgentReadOnlyMacros(context, fields, examples) {
    const now = moment(context.now);
    return {
        characterValues: {
            charPrompt: fields.system,
            charInstruction: fields.jailbreak,
            description: fields.description,
            personality: fields.personality,
            scenario: fields.scenario,
            persona: fields.persona,
            personaPosition: context.character.personaPosition,
            mesExamplesRaw: fields.mesExamples,
            mesExamples: examples,
            charDepthPrompt: fields.charDepthPrompt,
            creatorNotes: fields.creatorNotes,
            version: fields.version,
            firstMessage: fields.firstMessage,
            alternateGreetings: fields.alternateGreetings,
        },
        builtins: {
            ...getInstructMacroValues({ charPrompt: fields.system }, context.settings),
            time: now.format('LT'),
            date: now.format('LL'),
            weekday: now.format('dddd'),
            isotime: now.format('HH:mm'),
            isodate: now.format('YYYY-MM-DD'),
            ...Object.fromEntries(['idleDuration', 'lastMessage', 'lastUserMessage', 'lastCharMessage',
                'firstIncludedMessageId', 'firstDisplayedMessageId', 'allChatRange']
                .map(key => [key, String(context.chat[key] ?? '')])),
            ...Object.fromEntries(['input', 'isMobile', 'lastGenerationType']
                .map(key => [key, String(context.state[key])])),
            ...Object.fromEntries(['maxPrompt', 'maxContext', 'maxResponse']
                .map(key => [key, String(context.system[key])])),
            reasoningPrefix: context.settings.reasoning.prefix ?? '',
            reasoningSuffix: context.settings.reasoning.suffix ?? '',
            reasoningSeparator: context.settings.reasoning.separator ?? '',
        },
    };
}

export function parseMesExamples(examplesStr, isInstruct, { settings = power_user, api = main_api, substitute = substituteParams } = {}) {
    if (!examplesStr || examplesStr.length === 0 || examplesStr === '<START>') {
        return [];
    }

    if (!examplesStr.startsWith('<START>')) {
        examplesStr = '<START>\n' + examplesStr.trim();
    }

    const exampleSeparator = settings.context.example_separator ? `${substitute(settings.context.example_separator)}\n` : '';
    const blockHeading = (api === 'openai' || isInstruct) ? '<START>\n' : exampleSeparator;
    const splitExamples = examplesStr.split(/<START>/gi).slice(1).map(block => `${blockHeading}${block.trim()}\n`);

    return splitExamples;
}

export function isStreamingEnabled() {
    return (
        (main_api == 'openai' &&
            oai_settings.stream_openai &&
            !(oai_settings.chat_completion_source == chat_completion_sources.OPENAI && ['o1-2024-12-17', 'o1'].includes(oai_settings.openai_model))
        )
        || (main_api == 'kobold' && kai_settings.streaming_kobold && kai_flags.can_use_streaming)
        || (main_api == 'novel' && nai_settings.streaming_novel)
        || (main_api == 'textgenerationwebui' && textgen_settings.streaming));
}

function showStopButton() {
    $('#mes_stop').css({ 'display': 'flex' });
}

function hideStopButton() {
    // prevent NOOP, because hideStopButton() gets called multiple times
    if ($('#mes_stop').css('display') !== 'none') {
        const restoreFocus = document.activeElement === document.getElementById('mes_stop');
        $('#mes_stop').css({ 'display': 'none' });
        if (restoreFocus) focusChatInput(ChatInputFocusIntent.RESTORATION);
        eventSource.emit(event_types.GENERATION_ENDED, chat.length);
    }
}

class StreamingProcessor {
    /**
     * Creates a new streaming processor.
     * @param {string} type Generation type
     * @param {boolean} forceName2 If true, force the use of name2
     * @param {Date} timeStarted Date when generation was started
     * @param {string} continueMessage Previous message if the type is 'continue'
     * @param {PromptReasoning} promptReasoning Prompt reasoning instance
     */
    constructor(type, forceName2, timeStarted, continueMessage, promptReasoning) {
        this.result = '';
        this.messageId = -1;
        /** @type {HTMLElement} */
        this.messageDom = null;
        /** @type {HTMLElement} */
        this.messageTextDom = null;
        this.writeMesText = createStreamingMesTextWriter();
        /** @type {HTMLElement} */
        this.messageTimerDom = null;
        /** @type {HTMLElement} */
        this.messageTokenCounterDom = null;
        /** @type {HTMLTextAreaElement} */
        this.sendTextarea = document.querySelector('#send_textarea');
        this.type = type;
        this.force_name2 = forceName2;
        this.isStopped = false;
        this.isFinished = false;
        this.generator = this.nullStreamingGeneration;
        this.abortController = new AbortController();
        this.firstMessageText = '...';
        this.timeStarted = timeStarted;
        /** @type {number?} */
        this.timeToFirstToken = null;
        this.createdAt = new Date();
        this.continueMessage = type === 'continue' ? continueMessage : '';
        this.swipes = [];
        /** @type {import('./scripts/logprobs.js').TokenLogprobs[]} */
        this.messageLogprobs = [];
        this.toolCalls = [];
        // Initialize reasoning in its own handler
        this.reasoningHandler = new ReasoningHandler(timeStarted);
        /** @type {PromptReasoning} */
        this.promptReasoning = promptReasoning;
        /** @type {string[]} */
        this.images = [];
        /** @type {string?} */
        this.reasoningSignature = null;
        /** @type {any?} */
        this.native = null;
        this.promptCache = null;
    }

    /**
     * Initializes DOM elements for the current message.
     * @param {number} messageId Current message ID
     * @param {boolean?} continueOnReasoning If continuing on reasoning
     */
    async #checkDomElements(messageId, continueOnReasoning = null) {
        if (this.messageDom === null || this.messageTextDom === null) {
            this.messageDom = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
            this.messageTextDom = this.messageDom?.querySelector('.mes_text');
            this.messageTimerDom = this.messageDom?.querySelector('.mes_timer');
            this.messageTokenCounterDom = this.messageDom?.querySelector('.tokenCounterDisplay');
        }
        if (continueOnReasoning) {
            await this.reasoningHandler.process(messageId, false, this.promptReasoning);
        }
        this.reasoningHandler.updateDom(messageId);
    }

    markUIGenStarted() {
        deactivateSendButtons();
    }

    markUIGenStopped() {
        unblockGeneration();
    }

    async onStartStreaming(text) {
        const continueOnReasoning = !!(this.type === 'continue' && this.promptReasoning.prefixReasoning);
        if (continueOnReasoning) {
            this.reasoningHandler.initContinue(this.promptReasoning);
        }

        let messageId = -1;

        if (this.type == 'impersonate') {
            this.sendTextarea.value = '';
            this.sendTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            await saveReply({ type: this.type, getMessage: text, fromStreaming: true });
            messageId = chat.length - 1;
            await this.#checkDomElements(messageId, continueOnReasoning);
            delete chat[messageId].extra.token_count;
            $(this.messageDom).find('.mes_generation_info, .tokenCounterDisplay').empty();
            this.markUIGenStarted();
        }
        hideSwipeButtons({ hideCounters: true });
        scrollChatToBottom({ waitForFrame: true });
        return messageId;
    }

    async onProgressStreaming(messageId, text, isFinal) {
        const isImpersonate = this.type == 'impersonate';
        const isContinue = this.type == 'continue';

        if (!isImpersonate && !isContinue && Array.isArray(this.swipes) && this.swipes.length > 0) {
            for (let i = 0; i < this.swipes.length; i++) {
                this.swipes[i] = cleanUpMessage({
                    getMessage: this.swipes[i],
                    isImpersonate: false,
                    isContinue: false,
                    displayIncompleteSentences: true,
                    stoppingStrings: this.stoppingStrings,
                });
            }
        }

        let processedText = cleanUpMessage({
            getMessage: text,
            isImpersonate: isImpersonate,
            isContinue: isContinue,
            displayIncompleteSentences: !isFinal,
            stoppingStrings: this.stoppingStrings,
        });

        if (!isFinal) {
            processedText = balanceStreamingMarkup(processedText);
        }

        if (isImpersonate) {
            this.sendTextarea.value = processedText;
            this.sendTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            const mesChanged = chat[messageId].mes !== processedText;
            await this.#checkDomElements(messageId);
            const currentTime = new Date();
            chat[messageId].mes = processedText;
            chat[messageId].gen_started = this.timeStarted;
            chat[messageId].gen_finished = currentTime;
            if (!chat[messageId].extra) {
                chat[messageId].extra = {};
            }
            chat[messageId].extra.time_to_first_token = this.timeToFirstToken;
            chat[messageId].extra.prompt_cache = this.promptCache ?? undefined;

            // Update reasoning
            await this.reasoningHandler.process(messageId, mesChanged, this.promptReasoning);
            processedText = chat[messageId].mes;

            // Token count update.
            const tokenCountText = this.reasoningHandler.reasoning + processedText;
            const currentTokenCount = isFinal && shouldCountMessageTokens() ? await getTokenCountAsync(tokenCountText, 0) : 0;
            if (currentTokenCount) {
                chat[messageId].extra.token_count = currentTokenCount;
                if (this.messageTokenCounterDom instanceof HTMLElement) {
                    this.messageTokenCounterDom.textContent = `${currentTokenCount}t`;
                }
            }

            if ((this.type == 'swipe' || this.type === 'continue') && Array.isArray(chat[messageId].swipes)) {
                chat[messageId].swipes[chat[messageId].swipe_id] = processedText;
                chat[messageId].swipe_info[chat[messageId].swipe_id] = {
                    'send_date': chat[messageId].send_date,
                    'gen_started': chat[messageId].gen_started,
                    'gen_finished': chat[messageId].gen_finished,
                    'extra': structuredClone(chat[messageId].extra),
                };
            }

            if (this.messageDom instanceof HTMLElement && this.messageTextDom instanceof HTMLElement) {
                if (isFinal) {
                    const { name, is_system, is_user } = chat[messageId];
                    replaceTransientMesTextHtmlWithRuntimePolicy(this.messageDom, messageFormatting(processedText, name, is_system, is_user, messageId));
                } else {
                    this.writeMesText(messageId, processedText);
                }
            }

            const timePassed = formatGenerationTimer(this.timeStarted, currentTime, currentTokenCount, this.reasoningHandler.getDuration(), this.timeToFirstToken);
            if (isFinal) {
                updateMessageGenerationInfo(this.messageDom, chat[messageId], timePassed.tokenRate);
            }
            if (this.messageTimerDom instanceof HTMLElement) {
                if (this.messageTimerDom.textContent !== timePassed.timerValue) {
                    this.messageTimerDom.textContent = timePassed.timerValue;
                }
                if (this.messageTimerDom.title !== timePassed.timerTitle) {
                    this.messageTimerDom.title = timePassed.timerTitle;
                }
            }

            this.setFirstSwipe(messageId);
        }

        if (!scrollLock) {
            scrollChatToBottom({ waitForFrame: true });
        }
    }

    /**
     * Finalizes an intermediary message after generation is complete, or a tool call is performed.
     * Performs essential message processing (code blocks, reasoning, swipes, attachments, events)
     * without the heavier finish operations (UI unlock - optional, auto-swipe, sound, save chat).
     * @param {number} messageId - The message ID to finalize.
     * @param {string} text - The message text.
     * @param {Object} options - Additional options for finalization.
     * @param {boolean} options.unlockUI - Whether to unlock the generation UI.
     * @param {boolean} options.hasToolCalls - Whether the message owns tool calls.
     */
    async finalizeIntermediaryMessage(messageId, text, { unlockUI = true, hasToolCalls = false }) {
        await this.onProgressStreaming(messageId, text, true);
        const messageElement = chatElement.find(`.mes[mesid="${messageId}"]`);
        const message = chat[messageId];

        if (this.type !== 'impersonate') {
            await this.reasoningHandler.finish(messageId);
        }

        if (Array.isArray(this.swipes) && this.swipes.length > 0) {
            const swipeInfoExtra = structuredClone(message.extra ?? {});
            delete swipeInfoExtra.token_count;
            delete swipeInfoExtra.reasoning;
            delete swipeInfoExtra.reasoning_duration;
            const swipeInfo = {
                send_date: message.send_date,
                gen_started: message.gen_started,
                gen_finished: message.gen_finished,
                extra: swipeInfoExtra,
            };
            const swipeInfoArray = Array(this.swipes.length).fill().map(() => structuredClone(swipeInfo));
            parseReasoningInSwipes(this.swipes, swipeInfoArray, message.extra?.reasoning_duration);
            message.swipes.push(...this.swipes);
            message.swipe_info.push(...swipeInfoArray);
        }

        if (this.type !== 'impersonate') {
            // Store provider metadata before syncing the active swipe.
            if (this.reasoningSignature) {
                message.extra.reasoning_signature = this.reasoningSignature;
            }
            if (this.native) {
                message.extra.native = this.native;
            }
            if (this.requestContext) {
                message.extra.api = this.requestContext.chatCompletionSource;
                message.extra.model = this.requestContext.model;
                if (this.native || this.reasoningSignature || hasToolCalls) {
                    message.extra.provider_replay = { ...this.requestContext, text: this.result };
                }
            }
        }

        syncMesToSwipe(messageId);
        saveLogprobsForActiveMessage(this.messageLogprobs.filter(Boolean), this.continueMessage);

        if (Array.isArray(this.images) && this.images.length > 0) {
            await processImageAttachment(message, { imageUrls: this.images });
            appendMediaToMessage(message, $(this.messageDom));
        }

        if (unlockUI) {
            this.markUIGenStopped();
        }

        if (this.type !== 'impersonate') {
            const emitMessageEvents = shouldEmitCharacterMessageEvents(message, hasToolCalls);
            if (emitMessageEvents) {
                await eventSource.emit(event_types.MESSAGE_RECEIVED, this.messageId, this.type);
            }
            await finalizeMessageContent(messageId, emitMessageEvents ? event_types.CHARACTER_MESSAGE_RENDERED : null, this.type);
        } else {
            await eventSource.emit(event_types.IMPERSONATE_READY, text);
        }

        updateSwipeCounter(messageId, { message, messageElement });
    }

    async onFinishStreaming(messageId, text) {
        await this.finalizeIntermediaryMessage(messageId, text, { unlockUI: true });

        const isAborted = this.abortController.signal.aborted;
        if (!isAborted && power_user.auto_swipe && generatedTextFiltered(text)) {
            return await swipe(null, SWIPE_DIRECTION.RIGHT, { source: SWIPE_SOURCE.AUTO_SWIPE, repeated: true, forceMesId: chat.length - 1 });
        }
        await saveChatConditional(this.type === 'impersonate'
            ? CHAT_COMMIT_REASON.MUTATION
            : CHAT_COMMIT_REASON.GENERATION_CHECKPOINT);

        playMessageSound();
    }

    async onErrorStreaming() {
        this.abortController.abort();
        this.isStopped = true;

        this.markUIGenStopped();

        const emitMessageEvents = !['swipe', 'impersonate', 'continue'].includes(this.type);
        if (emitMessageEvents) {
            await eventSource.emit(event_types.MESSAGE_RECEIVED, this.messageId, this.type);
        }
        if (this.type !== 'impersonate' && this.messageId >= 0) {
            await finalizeMessageContent(this.messageId, emitMessageEvents ? event_types.CHARACTER_MESSAGE_RENDERED : null, this.type);
        }
    }

    setFirstSwipe(messageId) {
        if (this.type !== 'swipe' && this.type !== 'impersonate') {
            if (Array.isArray(chat[messageId].swipes) && chat[messageId].swipes.length === 1 && chat[messageId].swipe_id === 0) {
                chat[messageId].swipes[0] = chat[messageId].mes;
                chat[messageId].swipe_info[0] = {
                    'send_date': chat[messageId].send_date,
                    'gen_started': chat[messageId].gen_started,
                    'gen_finished': chat[messageId].gen_finished,
                    'extra': structuredClone(chat[messageId].extra),
                };
            }
        }
    }

    onStopStreaming() {
        this.abortController.abort();
        this.isFinished = true;
    }

    /**
     * @returns {AsyncGenerator<{ text: string, swipes: string[], logprobs: import('./scripts/logprobs.js').TokenLogprobs, toolCalls: any[], state: any }, void, void>}
     */
    async* nullStreamingGeneration() {
        throw new Error('Generation function for streaming is not hooked up');
    }

    async generate() {
        if (this.messageId == -1) {
            this.messageId = await this.onStartStreaming(this.firstMessageText);
            await delay(1); // delay for message to be rendered
            scrollLock = false;
        }

        // Stopping strings are expensive to calculate, especially with macros enabled. To remove stopping strings
        // when streaming, we cache the result of getStoppingStrings instead of calling it once per token.
        const isImpersonate = this.type == 'impersonate';
        const isContinue = this.type == 'continue';
        this.stoppingStrings = getStoppingStrings(isImpersonate, isContinue, main_api);

        try {
            const streamingFps = normalizeStreamingFps(power_user.streaming_fps);
            const sw = new Stopwatch(getStreamingRenderInterval({
                configuredFps: streamingFps,
                hidden: document.hidden,
            }));
            const timestamps = [];
            for await (const { text, swipes, logprobs, toolCalls, state } of this.generator()) {
                const now = Date.now();
                timestamps.push(now);
                if (!this.timeToFirstToken) {
                    this.timeToFirstToken = now - this.createdAt.getTime();
                }
                if (this.isStopped || this.abortController.signal.aborted) {
                    return this.result;
                }

                this.toolCalls = toolCalls;
                this.result = text;
                this.swipes = Array.from(swipes ?? []);
                if (logprobs) {
                    this.messageLogprobs.push(...(Array.isArray(logprobs) ? logprobs : [logprobs]));
                }
                // Get the updated reasoning string into the handler. Without returned reasoning it keeps its own, which auto-parse may have filled.
                const continuation = this.promptReasoning.formatContinuation(state?.reasoning);
                this.reasoningHandler.updateReasoning(this.messageId, continuation && this.promptReasoning.prefixReasoning + continuation);
                this.images = state?.images ?? [];
                this.reasoningSignature = state?.signature ?? null;
                this.native = state?.native ?? null;
                this.requestContext = state?.requestContext ?? null;
                this.promptCache = getPromptCacheUsage(state?.usage);
                await eventSource.emit(event_types.STREAM_TOKEN_RECEIVED, text);
                sw.interval = getStreamingRenderInterval({
                    configuredFps: streamingFps,
                    hidden: document.hidden,
                });
                await sw.tick(async () => await this.onProgressStreaming(this.messageId, this.continueMessage + text));
            }
            const seconds = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
            console.warn(`Stream stats: ${timestamps.length} tokens, ${seconds.toFixed(2)} seconds, rate: ${Number(timestamps.length / seconds).toFixed(2)} TPS`);
        } catch (err) {
            // in the case of a self-inflicted abort, we have already cleaned up
            if (!this.isFinished) {
                console.error(err);
                await this.onErrorStreaming();
            }
            return this.result;
        }

        this.isFinished = true;
        return this.result;
    }
}

export function createRawPrompt(prompt, api, instructOverride, quietToLoud, systemPrompt, prefill) {
    const isInstruct = power_user.instruct.enabled && api !== 'openai' && api !== 'novel' && !instructOverride;

    // If the prompt was given as a string, convert to a message-style object assuming user role
    if (typeof prompt === 'string') {
        const message = { role: 'user', content: prompt.trim() };
        prompt = [message];
    } else {  // checks for message-style object
        if (prompt.length === 0 && !systemPrompt) throw Error('No messages provided');
    }

    // Substitute the prefill if provided
    prefill = substituteParams(prefill ?? '');

    // Format each message in the prompt, accounting for the provided roles
    for (const message of prompt) {
        let name = '';
        if (message.role === 'user') name = message.name ?? name1;
        if (message.role === 'assistant') name = message.name ?? name2;
        if (message.role === 'system') name = message.name ?? '';
        const prefix = isInstruct || api === 'openai' ? '' : (name ? `${name}: ` : '');
        message.content = prefix + substituteParams(message.content ?? '');
        if (isInstruct) {  // instruct formatting for text completion
            const isUser = message.role === 'user';
            const isNarrator = message.role === 'system';
            message.content = formatInstructModeChat(name, message.content, isUser, isNarrator, '', name1, name2, false);
        }
    }

    // prepend system prompt, if provided
    if (systemPrompt) {
        systemPrompt = substituteParams(systemPrompt);
        systemPrompt = isInstruct ? formatInstructModeStoryString(systemPrompt) : systemPrompt.trim();
        if (isInstruct && systemPrompt.length > 0 && !systemPrompt.endsWith('\n')) {
            if (power_user.instruct.wrap && !power_user.instruct.story_string_suffix) {
                systemPrompt += '\n';
            }
        }
        prompt.unshift({ role: 'system', content: systemPrompt });
    }

    // with Chat Completion, the prefill is an additional assistant message at the end.
    if (api === 'openai' && prefill) {
        prompt.push({ role: 'assistant', content: prefill });
    }

    // if text completion, convert to text prompt by concatenating all message contents and adding the prefill as a promptBias.
    if (api !== 'openai') {
        const joiner = isInstruct ? '' : '\n';
        prompt = prompt.map(message => message.content).join(joiner);
        prompt = api === 'novel' ? adjustNovelInstructionPrompt(prompt) : prompt;
        prompt = prompt + (isInstruct ? formatInstructModePrompt(name2, false, prefill, name1, name2, true, quietToLoud) : `\n${prefill}`);  // add last line
    }

    return prompt;
}

export async function generateRawData({ prompt = '', api = null, instructOverride = false, quietToLoud = false, systemPrompt = '', responseLength = null, prefill = '', jsonSchema = null } = {}) {
    if (!api) {
        api = main_api;
    }

    const abortController = new AbortController();
    const responseLengthCustomized = typeof responseLength === 'number' && responseLength > 0;
    let eventHook = () => { };

    // construct final prompt from the input. Can either be a string or an array of chat-style messages.
    prompt = createRawPrompt(prompt, api, instructOverride, quietToLoud, systemPrompt, prefill);

    // Allow extensions to stop generation before it happens
    const eventAbortController = new AbortController();
    const abortHook = () => {
        abortController.abort(new Error('Cancelled by stop event'));
        eventAbortController.abort(new Error('Cancelled by extension'));
    };
    eventSource.on(event_types.GENERATION_STOPPED, abortHook);

    try {
        if (responseLengthCustomized) {
            TempResponseLength.save(api, responseLength);
        }
        /** @type {object|any[]} */
        let generateData = {};

        // Allow extensions to modify the prompt before generation
        // 1. for text completion
        if (typeof prompt === 'string') {
            const eventData = { prompt: prompt, dryRun: false };
            await eventSource.emit(event_types.GENERATE_AFTER_COMBINE_PROMPTS, eventData);
            prompt = eventData.prompt;
        }
        // 2. for chat completion
        if (Array.isArray(prompt)) {
            const eventData = { chat: prompt, dryRun: false };
            await eventSource.emit(event_types.CHAT_COMPLETION_PROMPT_READY, eventData);
            prompt = eventData.chat;
        }

        // Check if the generation was aborted during the event
        eventAbortController.signal.throwIfAborted();

        switch (api) {
            case 'kobold':
            case 'koboldhorde':
                if (kai_settings.preset_settings === 'gui') {
                    generateData = { prompt: prompt, type: 'quiet', gui_settings: true, max_length: amount_gen, max_context_length: max_context, api_server: kai_settings.api_server };
                } else {
                    const isHorde = api === 'koboldhorde';
                    const koboldSettings = koboldai_settings[koboldai_setting_names[kai_settings.preset_settings]];
                    generateData = getKoboldGenerationData(prompt.toString(), koboldSettings, amount_gen, max_context, isHorde, 'quiet');
                }
                TempResponseLength.restore(api);
                break;
            case 'novel': {
                const novelSettings = novelai_settings[novelai_setting_names[nai_settings.preset_settings_novel]];
                generateData = getNovelGenerationData(prompt, novelSettings, amount_gen, false, false, null, 'quiet');
                TempResponseLength.restore(api);
                break;
            }
            case 'textgenerationwebui':
                generateData = await getTextGenGenerationData(prompt, amount_gen, false, false, null, 'quiet');
                TempResponseLength.restore(api);
                break;
            case 'openai': {
                generateData = prompt;  // generateData is just the chat message object
                eventHook = TempResponseLength.setupEventHook(api);
            } break;
        }

        let data = {};

        if (api === 'koboldhorde') {
            data = await generateHorde(prompt.toString(), generateData, abortController.signal, false);
        } else if (api === 'openai') {
            data = await sendOpenAIRequest('quiet', generateData, abortController.signal, { jsonSchema });
        } else {
            const generateUrl = getGenerateUrl(api);
            const response = await fetch(generateUrl, {
                method: 'POST',
                headers: getRequestHeaders(),
                cache: 'no-cache',
                body: JSON.stringify(generateData),
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw await response.json();
            }

            data = await response.json();
        }

        // should only happen for text completions
        // other frontend paths do not return data if calling the backend fails,
        // they throw things instead
        if (data.error) {
            throw new Error(data.response);
        }

        if (jsonSchema) {
            return extractJsonFromData(data, {
                mainApi: api,
                chatCompletionSource: generateData?.chat_completion_source,
                model: generateData?.model,
                returnInvalidJson: jsonSchema.returnInvalid,
            });
        }

        return data;
    } finally {
        eventSource.removeListener(event_types.GENERATION_STOPPED, abortHook);
        if (responseLengthCustomized && TempResponseLength.isCustomized()) {
            TempResponseLength.restore(api);
            TempResponseLength.removeEventHook(api, eventHook);
        }
    }
}

export async function generateRaw({ prompt = '', api = null, instructOverride = false, quietToLoud = false, systemPrompt = '', responseLength = null, trimNames = true, prefill = '', jsonSchema = null } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('generateRaw called with positional arguments. Please use an object instead.');
        [prompt, api, instructOverride, quietToLoud, systemPrompt, responseLength, trimNames, prefill, jsonSchema] = arguments;
    }

    const data = await generateRawData({ prompt, api, instructOverride, quietToLoud, systemPrompt, responseLength, prefill, jsonSchema });

    // JSON string (matching the provided schema) will already be extracted.
    if (jsonSchema) {
        return data;
    }

    // format result, exclude user prompt bias
    const message = cleanUpMessage({
        getMessage: extractMessageFromData(data, api),
        isImpersonate: false,
        isContinue: false,
        displayIncompleteSentences: true,
        includeUserPromptBias: false,
        trimNames: trimNames,
        trimWrongNames: trimNames,
    });

    if (!message) {
        throw new Error('No message generated');
    }

    return message;
}

class TempResponseLength {
    static #originalResponseLength = -1;
    static #lastApi = null;
    /** @type {Promise<void>} */
    static #restorePromise = Promise.resolve();
    /** @type {(() => void) | null} */
    static #resolveRestore = null;

    static isCustomized() {
        return this.#originalResponseLength > -1;
    }

    static waitForRestore() {
        return this.#restorePromise;
    }

    /**
     * Save the current response length for the specified API.
     * @param {string} api API identifier
     * @param {number} responseLength New response length
     */
    static save(api, responseLength) {
        this.#restorePromise = new Promise(resolve => {
            this.#resolveRestore = resolve;
        });
        if (api === 'openai') {
            this.#originalResponseLength = oai_settings.openai_max_tokens;
            oai_settings.openai_max_tokens = responseLength;
        } else {
            this.#originalResponseLength = amount_gen;
            amount_gen = responseLength;
        }

        this.#lastApi = api;
        console.log('[TempResponseLength] Saved original response length:', TempResponseLength.#originalResponseLength);
    }

    /**
     * Restore the original response length for the specified API.
     * @param {string|null} api API identifier
     * @returns {void}
     */
    static restore(api) {
        if (this.#originalResponseLength === -1) {
            return;
        }
        if (!api && this.#lastApi) {
            api = this.#lastApi;
        }
        if (api === 'openai') {
            oai_settings.openai_max_tokens = this.#originalResponseLength;
        } else {
            amount_gen = this.#originalResponseLength;
        }

        console.log('[TempResponseLength] Restored original response length:', this.#originalResponseLength);
        this.#originalResponseLength = -1;
        this.#lastApi = null;
        this.#resolveRestore?.();
        this.#resolveRestore = null;
    }

    /**
     * Sets up an event hook to restore the original response length when the event is emitted.
     * @param {string} api API identifier
     * @returns {function(): void} Event hook function
     */
    static setupEventHook(api) {
        const eventHook = () => {
            if (this.isCustomized()) {
                this.restore(api);
            }
        };

        switch (api) {
            case 'openai':
                eventSource.once(event_types.CHAT_COMPLETION_SETTINGS_READY, eventHook);
                break;
            default:
                eventSource.once(event_types.GENERATE_AFTER_DATA, eventHook);
                break;
        }

        return eventHook;
    }

    /**
     * Removes the event hook for the specified API.
     * @param {string} api API identifier
     * @param {function(): void} eventHook Previously set up event hook
     */
    static removeEventHook(api, eventHook) {
        switch (api) {
            case 'openai':
                eventSource.removeListener(event_types.CHAT_COMPLETION_SETTINGS_READY, eventHook);
                break;
            default:
                eventSource.removeListener(event_types.GENERATE_AFTER_DATA, eventHook);
                break;
        }
    }
}

function hideMessageBeforeRemoval(messageId) {
    return new Promise((resolve) => {
        const lastMes = $(chatSurface.getMessageElement(messageId));
        if (lastMes.length === 0) {
            return resolve();
        }
        lastMes.hide(animation_duration, resolve);
    });
}

const generationIdleGate = createGenerationIdleGate();

const LEGACY_MCP_GENERATION_CONTEXT = Symbol('legacyMcpGenerationContext');

let generationInFlightCount = 0;

let generationHistoryLocator = null;

export function waitForGenerationIdle() {
    return generationIdleGate.wait();
}

async function enterGeneration(dryRun) {
    if (generationInFlightCount === 0) {
        generationIdleGate.markBusy();
        generationInFlightCount = 1;
        generationHistoryLocator = null;

        // Prompt-assembly dry runs do not define a chat-history transaction.
        if (dryRun) return;

        try {
            generationHistoryLocator = getActiveChatSnapshot().ref;
        } catch (error) {
            generationHistoryLocator = null;
            console.warn('Failed to capture chat-history generation locator', error);
        }

        if (generationHistoryLocator) {
            try {
                await invoke('chat_history_generation_started', { locator: generationHistoryLocator });
            } catch (error) {
                console.error('Failed to report chat-history generation start', error);
            }
        }
        return;
    }
    generationInFlightCount += 1;
}

async function exitGeneration() {
    if (generationInFlightCount <= 0) {
        throw new Error('Generation in-flight counter underflow');
    }

    generationInFlightCount -= 1;
    if (generationInFlightCount === 0) {
        const locator = generationHistoryLocator;
        generationHistoryLocator = null;
        try {
            if (locator) {
                await invoke('chat_history_generation_finished', { locator });
            }
        } catch (error) {
            console.error('Failed to report chat-history generation finish', error);
        } finally {
            generationIdleGate.markIdle();
        }
    }
}

export async function Generate(type, options = {}, dryRun = false) {
    await enterGeneration(dryRun);
    try {
        return await GenerateInternal(type, options, dryRun);
    } catch (error) {
        cleanupGenerationAfterUnhandledError(type, dryRun);
        throw error;
    } finally {
        await exitGeneration();
    }
}

function cleanupGenerationAfterUnhandledError(type, dryRun) {
    if (!shouldUnblockGenerationAfterUnhandledError({
        dryRun,
        isSendPress: is_send_press,
        isBodyGenerating: document.body.dataset.generating === 'true',
        isGroupGenerating: is_group_generating,
    })) {
        return;
    }

    unblockGeneration(type);
}

async function prepareLegacyMcpGenerationContext(dryRun) {
    try {
        const context = await createLegacyMcpGenerationContext({ locale: getCurrentLocale() });
        if (!dryRun && context.diagnostics.length > 0) {
            toastr.warning(
                'Some MCP tools are unavailable for this generation. Check MCP Manager and the console for details.',
                'MCP tools unavailable',
            );
        }
        return context;
    } catch (error) {
        console.error('Failed to prepare Legacy MCP tools:', error);
        if (!dryRun) {
            toastr.warning(
                'MCP tools are unavailable for this generation. Local tools and normal generation are unaffected.',
                'MCP tools unavailable',
            );
        }
        return createUnavailableLegacyMcpGenerationContext(error);
    }
}

async function GenerateInternal(type, { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage, quietName, jsonSchema = null, depth = 0, agentMode = false, agentProfileId = null, agentContextPolicy = null, agentSystemPrompt = null, quietToolRequest = null, [LEGACY_MCP_GENERATION_CONTEXT]: inheritedLegacyMcpContext = null } = {}, dryRun = false) {
    console.log('Generate entered');
    setGenerationProgress(0);
    generation_started = new Date();
    const resolvedAgentContextPolicy = agentMode ? normalizeAgentContextPolicy(agentContextPolicy) : null;
    const resolvedAgentSystemPrompt = agentMode ? normalizeAgentSystemPrompt(agentSystemPrompt) : null;

    // Prevent generation from shallow characters
    await unshallowCharacter(this_chid);

    // Occurs every time, even if the generation is aborted due to slash commands execution
    await eventSource.emit(event_types.GENERATION_STARTED, type, { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage }, dryRun);

    // Don't recreate abort controller if signal is passed
    if (!(abortController && signal)) {
        abortController = new AbortController();
    }

    // OpenAI doesn't need instruct mode. Use OAI main prompt instead.
    const isInstruct = power_user.instruct.enabled && main_api !== 'openai';
    const isImpersonate = type == 'impersonate';

    if (!(dryRun || depth || type == 'regenerate' || type == 'swipe' || type == 'quiet')) {
        const interruptedByCommand = await processCommands(String($('#send_textarea').val()));

        if (interruptedByCommand) {
            //$("#send_textarea").val('')[0].dispatchEvent(new Event('input', { bubbles:true }));
            unblockGeneration(type);
            return Promise.resolve();
        }
    }

    // Occurs only if the generation is not aborted due to slash commands execution
    await eventSource.emit(event_types.GENERATION_AFTER_COMMANDS, type, { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage }, dryRun);

    if (main_api == 'kobold' && kai_settings.streaming_kobold && !kai_flags.can_use_streaming) {
        toastr.error(t`Streaming is enabled, but the version of Kobold used does not support token streaming.`, undefined, { timeOut: 10000, preventDuplicates: true });
        unblockGeneration(type);
        return Promise.resolve();
    }

    if (isHordeGenerationNotAllowed()) {
        unblockGeneration(type);
        return Promise.resolve();
    }

    if (!dryRun) {
        // Ping server to make sure it is still alive
        const pingResult = await pingServer();

        if (!pingResult) {
            unblockGeneration(type);
            toastr.error(t`Verify that the server is running and accessible.`, t`ST Server cannot be reached`);
            throw new Error('Server unreachable');
        }

        // Hide swipes if not in a dry run.
        hideSwipeButtons();
        // If generated any message, set the flag to indicate it can't be recreated again.
        chat_metadata.tainted = true;
    }

    if (selected_group && !is_group_generating) {
        if (!dryRun) {
            // Returns the promise that generateGroupWrapper returns; resolves when generation is done
            return generateGroupWrapper(false, type, { quiet_prompt, force_chid, signal: abortController.signal, quietImage, jsonSchema, quietToolRequest });
        }

        const characterIndexMap = new Map(characters.map((char, index) => [char.avatar, index]));
        const group = groups.find((x) => x.id === selected_group);

        const enabledMembers = group.members.reduce((acc, member) => {
            if (!group.disabled_members.includes(member) && !acc.includes(member)) {
                acc.push(member);
            }
            return acc;
        }, []);

        const memberIds = enabledMembers
            .map((member) => characterIndexMap.get(member))
            .filter((index) => index !== undefined && index !== null);

        if (memberIds.length > 0) {
            if (menu_type != 'character_edit') setCharacterId(memberIds[0]);
            setCharacterName('');
        } else {
            console.log('No enabled members found');
            unblockGeneration(type);
            return Promise.resolve();
        }
    }

    //#########QUIET PROMPT STUFF##############
    //this function just gives special care to novel quiet instruction prompts
    if (quiet_prompt) {
        quiet_prompt = substituteParams(quiet_prompt);
        quiet_prompt = main_api == 'novel' && !quietToLoud ? adjustNovelInstructionPrompt(quiet_prompt) : quiet_prompt;
    }

    const hasBackendConnection = online_status !== 'no_connection';

    // We can't do anything because we're not in a chat right now. (Unless it's a dry run, in which case we need to
    // assemble the prompt so we can count its tokens regardless of whether a chat is active.)
    if (!dryRun && !hasBackendConnection) {
        is_send_press = false;
        return Promise.resolve();
    }

    const lastMessageId = chat.length > 0 ? chat.length - 1 : null;
    const lastMessage = chat.at(-1);

    let textareaText;
    if (type !== 'regenerate' && type !== 'swipe' && type !== 'quiet' && !isImpersonate && !dryRun && !depth) {
        is_send_press = true;
        textareaText = String($('#send_textarea').val());
        $('#send_textarea').val('')[0].dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        textareaText = '';
        if (lastMessage?.is_user) {
            //do nothing? why does this check exist?
        } else if (type !== 'quiet' && type !== 'swipe' && !isImpersonate && !dryRun && !depth && lastMessageId !== null) {
            await hideMessageBeforeRemoval(lastMessageId);
            await deleteMessage(lastMessageId);
        }
    }

    const isContinue = type == 'continue';

    // Rewrite the generation timer to account for the time passed for all the continuations.
    if (isContinue && chat.length) {
        const prevFinished = lastMessage.gen_finished;
        const prevStarted = lastMessage.gen_started;

        if (prevFinished && prevStarted) {
            const timePassed = Number(prevFinished) - Number(prevStarted);
            generation_started = new Date(Date.now() - timePassed);
            lastMessage.gen_started = generation_started;
        }
    }

    if (!dryRun) {
        deactivateSendButtons();
    }

    let { messageBias, promptBias, isUserPromptBias } = getBiasStrings(textareaText, type);

    //*********************************
    //PRE FORMATING STRING
    //*********************************

    // These generation types should not attach pending files to the chat
    const noAttachTypes = [
        'regenerate',
        'swipe',
        'impersonate',
        'quiet',
        'continue',
    ];
    //for normal messages sent from user..
    if ((textareaText != '' || (hasPendingFileAttachment() && !noAttachTypes.includes(type))) && !automatic_trigger && type !== 'quiet' && !dryRun && !depth) {
        // If user message contains no text other than bias - send as a system message
        if (messageBias && !removeMacros(textareaText)) {
            sendSystemMessage(system_message_types.GENERIC, ' ', { bias: messageBias });
        } else {
            await sendMessageAsUserAtProviderBarrier(textareaText, messageBias);
        }
    } else if (textareaText == '' && !automatic_trigger && !dryRun && [undefined, 'normal'].includes(type) && main_api == 'openai' && oai_settings.send_if_empty.trim().length > 0 && !depth) {
        // Use send_if_empty if set and the user message is empty. Only when sending messages normally
        await sendMessageAsUserAtProviderBarrier(oai_settings.send_if_empty.trim(), messageBias);
    }

    const characterFields = getCharacterCardFields();
    let {
        description,
        personality,
        persona,
        scenario,
        mesExamples,
        system,
        jailbreak,
        charDepthPrompt,
        creatorNotes,
    } = characterFields;

    // Depth prompt (character-specific A/N)
    removeDepthPrompts();
    const groupDepthPrompts = getGroupDepthPrompts(selected_group, Number(this_chid));

    if (selected_group && Array.isArray(groupDepthPrompts) && groupDepthPrompts.length > 0) {
        groupDepthPrompts.forEach((value, index) => {
            const role = getExtensionPromptRoleByName(value.role);
            setExtensionPrompt(inject_ids.DEPTH_PROMPT_INDEX(index), value.text, extension_prompt_types.IN_CHAT, value.depth, extension_settings.note.allowWIScan, role);
        });
    } else {
        const depthPromptText = charDepthPrompt || '';
        const depthPromptDepth = characters[this_chid]?.data?.extensions?.depth_prompt?.depth ?? depth_prompt_depth_default;
        const depthPromptRole = getExtensionPromptRoleByName(characters[this_chid]?.data?.extensions?.depth_prompt?.role ?? depth_prompt_role_default);
        setExtensionPrompt(inject_ids.DEPTH_PROMPT, depthPromptText, extension_prompt_types.IN_CHAT, depthPromptDepth, extension_settings.note.allowWIScan, depthPromptRole);
    }

    // Determine token limit.
    let this_max_context = getMaxPromptTokens();

    // First message in fresh 1-on-1 chat reacts to user/character settings changes
    const firstMessageText = chat.length && !quietToolRequest ? substituteParams(chat[0].mes) : null;
    if (firstMessageText !== null && !dryRun) {
        chat[0].mes = firstMessageText;
    }

    // Collect messages with usable content
    const canPerformToolCalls = !dryRun && ToolManager.canPerformToolCalls(type) && depth < ToolManager.RECURSE_LIMIT;
    const canAdvertiseToolCalls = ToolManager.canAdvertiseToolCalls(type) && depth < ToolManager.RECURSE_LIMIT;
    const stripOldToolCalls = main_api === 'openai'
        && !agentMode
        && oai_settings.function_calling
        && oai_settings.strip_old_tool_calls;
    const useLegacyMcpTools = main_api === 'openai' && !agentMode && canAdvertiseToolCalls;
    const legacyMcpContext = useLegacyMcpTools
        ? inheritedLegacyMcpContext ?? await prepareLegacyMcpGenerationContext(dryRun)
        : inheritedLegacyMcpContext;
    const legacyMcpToolRound = useLegacyMcpTools ? legacyMcpContext.createRound() : null;
    const hiddenToolOwners = new Map();
    let coreChat = chat.filter(message => {
        if (main_api === 'openai') {
            if (message.role === 'tool') {
                return hiddenToolOwners.get(message.tool_call_id) !== true;
            }
            if (!message.is_user && Array.isArray(message.tool_calls)) {
                for (const call of message.tool_calls) {
                    hiddenToolOwners.set(call.id, Boolean(message.is_system));
                }
            }
        }
        return !message.is_system
            || (main_api === 'openai' && Object.hasOwn(message.extra ?? {}, 'tool_invocations'));
    });
    if (type === 'swipe') {
        coreChat.pop();
    }
    if (stripOldToolCalls) {
        coreChat = stripOldToolTurns(coreChat);
    }

    const coreChatRegexedMessages = await getRegexedStringBatchAsync(coreChat.map((/** @type {ChatMessage} */ chatItem, index) => ({
        rawString: chatItem.role === 'tool' ? '' : chatItem === chat[0] && firstMessageText !== null ? firstMessageText : chatItem.mes,
        placement: chatItem.is_user ? regex_placement.USER_INPUT : regex_placement.AI_OUTPUT,
        params: { isPrompt: true, depth: (coreChat.length - index - (isContinue ? 2 : 1)) },
    })));

    const chatMessageIds = new Map(chat.map((message, messageId) => [message, messageId]));
    coreChat = await Promise.all(coreChat.map(async (/** @type {ChatMessage} */ chatItem, index) => {
        if (chatItem.role === 'tool') {
            return { ...chatItem, index };
        }
        let regexedMessage = coreChatRegexedMessages[index];
        regexedMessage = await appendFileContent(chatItem, regexedMessage);

        const titles = [];
        if (chatItem?.extra?.append_title && chatItem?.extra?.title) {
            titles.push(chatItem.extra.title);
        }
        if (Array.isArray(chatItem?.extra?.media)) {
            for (const mediaItem of chatItem.extra.media) {
                if (mediaItem?.title && mediaItem?.append_title) {
                    titles.push(mediaItem.title);
                }
            }
        }
        if (titles.length > 0) {
            regexedMessage = `${regexedMessage}\n\n${titles.join('\n\n')}`;
        }

        return {
            ...chatItem,
            mes: regexedMessage,
            index,
            [CHAT_MESSAGE_ID]: chatMessageIds.get(chatItem),
        };
    }));

    const promptReasoning = new PromptReasoning();
    const regexedReasoning = await getRegexedStringBatchAsync(coreChat.map((chatItem, index) => ({
        rawString: String(chatItem.extra?.reasoning ?? ''),
        placement: regex_placement.REASONING,
        params: { isPrompt: true, depth: coreChat.length - index - (isContinue ? 2 : 1) },
    })));

    for (let i = coreChat.length - 1; i >= 0; i--) {
        if (coreChat[i].role === 'tool') {
            continue;
        }
        const isPrefix = isContinue && i === coreChat.length - 1;

        // In group chats, only include reasoning from the currently generating character
        const isOtherGroupMember = selected_group && coreChat[i].name !== name2;

        coreChat[i] = {
            ...coreChat[i],
            mes: isOtherGroupMember
                ? coreChat[i].mes
                : promptReasoning.addToMessage(
                    coreChat[i].mes,
                    regexedReasoning[i],
                    isPrefix,
                    coreChat[i].extra?.reasoning_duration,
                ),
        };
        if (promptReasoning.isLimitReached()) {
            break;
        }
    }

    if (!dryRun) {
        console.debug('Running extension interceptors');
        const aborted = await runGenerationInterceptors(coreChat, this_max_context, type);

        if (aborted) {
            console.debug('Generation aborted by extension interceptors');
            unblockGeneration(type);
            return Promise.resolve();
        }
    } else {
        console.debug('Skipping extension interceptors for dry run');
    }

    const fullContextCoreChat = coreChat;

    // Adjust token limit for Horde
    let adjustedParams;
    if (main_api == 'koboldhorde' && (horde_settings.auto_adjust_context_length || horde_settings.auto_adjust_response_length)) {
        try {
            adjustedParams = await adjustHordeGenerationParams(max_context, amount_gen);
        } catch {
            unblockGeneration(type);
            return Promise.resolve();
        }
        if (horde_settings.auto_adjust_context_length) {
            this_max_context = (adjustedParams.maxContextLength - adjustedParams.maxLength);
        }
    }

    // Fetches the combined prompt for both negative and positive prompts
    const cfgGuidanceScale = getGuidanceScale();
    const useCfgPrompt = cfgGuidanceScale && cfgGuidanceScale.value !== 1;

    // Adjust max context based on CFG prompt to prevent overfitting
    if (useCfgPrompt) {
        const negativePrompt = getCfgPrompt(cfgGuidanceScale, true, true)?.value || '';
        const positivePrompt = getCfgPrompt(cfgGuidanceScale, false, true)?.value || '';
        if (negativePrompt || positivePrompt) {
            const previousMaxContext = this_max_context;
            const [negativePromptTokenCount, positivePromptTokenCount] = await Promise.all([getTokenCountAsync(negativePrompt), getTokenCountAsync(positivePrompt)]);
            const decrement = Math.max(negativePromptTokenCount, positivePromptTokenCount);
            this_max_context -= decrement;
            console.log(`Max context reduced by ${decrement} tokens of CFG prompt (${previousMaxContext} -> ${this_max_context})`);
        }
    }

    console.log(`Core/all messages: ${coreChat.length}/${chat.length}`);

    if ((promptBias && !isUserPromptBias) || power_user.always_force_name2 || main_api == 'novel') {
        force_name2 = true;
    }

    if (isImpersonate) {
        force_name2 = false;
    }

    let mesExamplesArray = parseMesExamples(mesExamples, isInstruct);
    const characterExamples = mesExamplesArray.join('');

    // Set non-WI AN
    setFloatingPrompt();

    // Add WI to prompt
    // Make quiet prompt available for WIAN
    setExtensionPrompt(inject_ids.QUIET_PROMPT, quiet_prompt || '', extension_prompt_types.IN_PROMPT, 0, true);
    const chatForWI = fullContextCoreChat.map(x => world_info_include_names ? `${x.name}: ${x.mes}` : x.mes).reverse();
    /** @type {import('./scripts/world-info.js').WIGlobalScanData} */
    const globalScanData = {
        personaDescription: persona,
        characterDescription: description,
        characterPersonality: personality,
        characterDepthPrompt: charDepthPrompt,
        scenario: scenario,
        creatorNotes: creatorNotes,
        trigger: GENERATION_TYPE_TRIGGERS.includes(type) ? type : 'normal',
    };
    let worldInfo;
    try {
        worldInfo = await getWorldInfoPrompt(chatForWI, this_max_context, dryRun, globalScanData);
    } finally {
        setExtensionPrompt(inject_ids.QUIET_PROMPT, '', extension_prompt_types.IN_PROMPT, 0, true);
    }
    const {
        worldInfoString, worldInfoBefore, worldInfoAfter, worldInfoExamples,
        worldInfoDepth, outletEntries, worldInfoActivation,
    } = worldInfo;
    let exampleBlocks = { before: [], character: mesExamplesArray, after: [] };
    for (const example of worldInfoExamples) {
        if (example.content.length === 0) continue;
        const cleanedExample = parseMesExamples(baseChatReplace(example.content), isInstruct);
        if (example.position === wi_anchor_position.before) {
            exampleBlocks.before.unshift(...cleanedExample);
        } else {
            exampleBlocks.after.push(...cleanedExample);
        }
    }
    mesExamplesArray = [...exampleBlocks.before, ...exampleBlocks.character, ...exampleBlocks.after];

    // At this point, the raw message examples can be created
    const mesExamplesRawArray = [...mesExamplesArray];

    if (mesExamplesArray && isInstruct) {
        mesExamplesArray = formatInstructModeExamples(mesExamplesArray, name1, name2);
    }

    if (skipWIAN !== true) {
        console.log('skipWIAN not active, adding WIAN');
        // Add all depth WI entries to prompt
        flushWIInjections();
        if (Array.isArray(worldInfoDepth)) {
            worldInfoDepth.forEach((e) => {
                const joinedEntries = e.entries.join('\n');
                setExtensionPrompt(inject_ids.CUSTOM_WI_DEPTH_ROLE(e.depth, e.role), joinedEntries, extension_prompt_types.IN_CHAT, e.depth, false, e.role);
            });
        }
        if (outletEntries && typeof outletEntries === 'object' && Object.keys(outletEntries).length > 0) {
            Object.entries(outletEntries).forEach(([key, value]) => {
                setExtensionPrompt(inject_ids.CUSTOM_WI_OUTLET(key), value.join('\n'), extension_prompt_types.NONE, 0);
            });
        }
    } else {
        console.log('skipping WIAN');
    }

    // Add persona description to prompt
    const personaAuthorsNote = preparePersonaDescriptionExtensionPrompt();
    const worldInfoAuthorsNote = worldInfo.anBefore.length || worldInfo.anAfter.length
        ? { before: worldInfo.anBefore.join('\n'), after: worldInfo.anAfter.join('\n') }
        : null;
    const authorsNote = extension_prompts[NOTE_MODULE_NAME];
    const authorsNoteAdditions = shouldWIAddPrompt && (worldInfoAuthorsNote || personaAuthorsNote) ? {
        position: authorsNote.position,
        depth: authorsNote.depth,
        role: authorsNote.role,
        worldInfo: worldInfoAuthorsNote,
        persona: personaAuthorsNote,
    } : null;
    if (!agentMode && authorsNoteAdditions) {
        const note = composeAuthorsNote(authorsNote, authorsNoteAdditions);
        setExtensionPrompt(NOTE_MODULE_NAME, note.value, note.position, note.depth, extension_settings.note.allowWIScan, note.role);
    }

    // Prepare the system prompt for Text Completion APIs
    if (main_api !== 'openai') {
        if (power_user.sysprompt.enabled) {
            system = power_user.prefer_character_prompt && system
                ? substituteParams(system, { original: power_user.sysprompt.content ?? '' })
                : baseChatReplace(power_user.sysprompt.content);
            system = isInstruct ? substituteParams(system, { original: power_user.sysprompt.content ?? '' }) : system;
        } else {
            // Nullify if it's not enabled
            system = '';
        }
    }

    // Collect before / after story string injections
    const beforeScenarioAnchor = await getExtensionPrompt(extension_prompt_types.BEFORE_PROMPT);
    const afterScenarioAnchor = await getExtensionPrompt(extension_prompt_types.IN_PROMPT);

    const storyStringParams = {
        description: description,
        personality: personality,
        persona: power_user.persona_description_position == persona_description_positions.IN_PROMPT ? persona : '',
        scenario: scenario,
        system: system,
        char: name2,
        user: name1,
        wiBefore: worldInfoBefore,
        wiAfter: worldInfoAfter,
        loreBefore: worldInfoBefore,
        loreAfter: worldInfoAfter,
        anchorBefore: beforeScenarioAnchor.trim(),
        anchorAfter: afterScenarioAnchor.trim(),
        mesExamples: mesExamplesArray.join(''),
        mesExamplesRaw: mesExamplesRawArray.join(''),
    };

    // Render the story string and combine with injections
    const storyString = renderStoryString(storyStringParams);
    let combinedStoryString = isInstruct ? formatInstructModeStoryString(storyString) : storyString;

    // Inject the story string as in-chat prompt (if needed)
    const applyStoryStringInject = main_api !== 'openai' && power_user.context.story_string_position === extension_prompt_types.IN_CHAT;
    if (applyStoryStringInject) {
        const depth = power_user.context.story_string_depth ?? 1;
        const role = power_user.context.story_string_role ?? extension_prompt_roles.SYSTEM;
        setExtensionPrompt(inject_ids.STORY_STRING, combinedStoryString, extension_prompt_types.IN_CHAT, depth, false, role);
        // Remove to prevent duplication
        combinedStoryString = '';
    } else {
        setExtensionPrompt(inject_ids.STORY_STRING, '', extension_prompt_types.IN_CHAT, 0);
    }

    // Story string rendered, safe to remove
    if (power_user.strip_examples) {
        mesExamplesArray = [];
        exampleBlocks = { before: [], character: [], after: [] };
    }

    // Inject all Depth prompts. Chat Completion does it separately
    let injectedIndices = [];
    if (main_api !== 'openai') {
        injectedIndices = await doChatInject(coreChat, isContinue);
    }

    if (main_api !== 'openai' && power_user.sysprompt.enabled) {
        jailbreak = power_user.prefer_character_jailbreak && jailbreak
            ? substituteParams(jailbreak, { original: power_user.sysprompt.post_history ?? '' })
            : baseChatReplace(power_user.sysprompt.post_history);

        // Only inject the jb if there is one
        if (jailbreak) {
            // When continuing generation of previous output, last user message precedes the message to continue
            if (isContinue) {
                coreChat.splice(coreChat.length - 1, 0, { mes: jailbreak, is_user: true });
            } else {
                // This operation will result in the injectedIndices indexes being off by one
                coreChat.push({ mes: jailbreak, is_user: true });
                // Add +1 to the elements to correct for the new PHI/Jailbreak message.
                injectedIndices.forEach(shiftUpByOne);
            }
        }
    }

    let chat2 = [];
    let continue_mag = '';
    let userMessageIndices = [];
    const lastUserMessageIndex = coreChat.findLastIndex(x => x.is_user);

    for (let i = coreChat.length - 1, j = 0; i >= 0; i--, j++) {
        if (main_api == 'openai') {
            chat2[i] = coreChat[j].mes;
            if (i === 0 && isContinue) {
                chat2[i] = chat2[i].slice(0, chat2[i].lastIndexOf(coreChat[j].mes) + coreChat[j].mes.length);
                continue_mag = coreChat[j].mes;
            }
            continue;
        }

        chat2[i] = formatMessageHistoryItem(coreChat[j], isInstruct, false);

        if (j === 0 && isInstruct) {
            // Reformat with the first output sequence (if any)
            chat2[i] = formatMessageHistoryItem(coreChat[j], isInstruct, force_output_sequence.FIRST);
        }

        if (lastUserMessageIndex >= 0 && j === lastUserMessageIndex && isInstruct && !isImpersonate) {
            // Reformat with the last input sequence (if any)
            chat2[i] = formatMessageHistoryItem(coreChat[j], isInstruct, force_output_sequence.LAST);
        }

        // Do not suffix the message for continuation
        if (i === 0 && isContinue) {
            // Pick something that's very unlikely to be in a message
            const FORMAT_TOKEN = '\u0000\ufffc\u0000\ufffd';

            if (isInstruct) {
                const originalMessage = String(coreChat[j].mes ?? '');
                coreChat[j].mes = originalMessage.replaceAll(FORMAT_TOKEN, '') + FORMAT_TOKEN;
                // Reformat with the last output sequence (if any)
                chat2[i] = formatMessageHistoryItem(coreChat[j], isInstruct, force_output_sequence.LAST);
                coreChat[j].mes = originalMessage;
            }

            chat2[i] = chat2[i].includes(FORMAT_TOKEN)
                ? chat2[i].slice(0, chat2[i].lastIndexOf(FORMAT_TOKEN))
                : chat2[i].slice(0, chat2[i].lastIndexOf(coreChat[j].mes) + coreChat[j].mes.length);
            continue_mag = coreChat[j].mes;
        }

        if (coreChat[j].is_user) {
            userMessageIndices.push(i);
        }
    }

    let addUserAlignment = isInstruct && power_user.instruct.user_alignment_message;
    let userAlignmentMessage = '';

    if (addUserAlignment) {
        const alignmentMessage = {
            name: name1,
            mes: substituteParams(power_user.instruct.user_alignment_message),
            is_user: true,
        };
        userAlignmentMessage = formatMessageHistoryItem(alignmentMessage, isInstruct, force_output_sequence.FIRST);
    }

    let oaiMessages = [];
    let oaiExampleBlocks = null;
    let oaiMessageExamples = [];

    if (main_api === 'openai') {
        oaiMessages = setOpenAIMessages(
            coreChat,
            stripOldToolCalls,
        );
        oaiExampleBlocks = {
            before: setOpenAIMessageExamples(exampleBlocks.before),
            character: setOpenAIMessageExamples(exampleBlocks.character),
            after: setOpenAIMessageExamples(exampleBlocks.after),
        };
        oaiMessageExamples = [...oaiExampleBlocks.before, ...oaiExampleBlocks.character, ...oaiExampleBlocks.after];
    }

    // hack for regeneration of the first message
    if (chat2.length == 0) {
        chat2.push('');
    }

    let examplesString = '';
    let chatString = addChatsPreamble(addChatsSeparator(''));
    let cyclePrompt = '';

    async function getMessagesTokenCount() {
        const encodeString = [
            combinedStoryString,
            examplesString,
            userAlignmentMessage,
            chatString,
            modifyLastPromptLine(''),
            cyclePrompt,
        ].join('').replace(/\r/gm, '');
        return getTokenCountAsync(encodeString, power_user.token_padding);
    }

    // Force pinned examples into the context
    let pinExmString;
    if (power_user.pin_examples) {
        pinExmString = examplesString = mesExamplesArray.join('');
    }

    // Only add the chat in context if past the greeting message
    if (isContinue && (chat2.length > 1 || main_api === 'openai')) {
        cyclePrompt = chat2.shift();
        // Adjust indices to account for the shift
        injectedIndices = injectedIndices.map(shiftDownByOne).filter(x => x >= 0);
        userMessageIndices = userMessageIndices.map(shiftDownByOne).filter(x => x >= 0);
    }

    // Collect enough messages to fill the context
    let arrMes = new Array(chat2.length);
    let tokenCount = await getMessagesTokenCount();
    let lastAddedIndex = 0;

    // Pre-allocate all injections first.
    // If it doesn't fit - user shot himself in the foot
    for (const index of injectedIndices) {
        // not needed for OAI prompting
        if (main_api == 'openai') {
            break;
        }

        const item = chat2[index];

        if (typeof item !== 'string') {
            continue;
        }

        tokenCount += await getTokenCountAsync(item.replace(/\r/gm, ''));
        if (tokenCount < this_max_context) {
            chatString = chatString + item;
            arrMes[index] = item;
            lastAddedIndex = Math.max(lastAddedIndex, index);
        } else {
            break;
        }
    }

    for (let i = 0; i < chat2.length; i++) {
        // not needed for OAI prompting
        if (main_api == 'openai') {
            break;
        }

        // Skip already injected messages
        if (arrMes[i] !== undefined) {
            continue;
        }

        const item = chat2[i];

        if (typeof item !== 'string') {
            continue;
        }

        tokenCount += await getTokenCountAsync(item.replace(/\r/gm, ''));
        if (tokenCount < this_max_context) {
            chatString = chatString + item;
            arrMes[i] = item;
            lastAddedIndex = Math.max(lastAddedIndex, i);
        } else {
            break;
        }
    }

    // Add user alignment message if last message is not a user message
    const stoppedAtUser = userMessageIndices.includes(lastAddedIndex);
    if (addUserAlignment && !stoppedAtUser) {
        tokenCount += await getTokenCountAsync(userAlignmentMessage.replace(/\r/gm, ''));
        chatString = userAlignmentMessage + chatString;
        arrMes.push(userAlignmentMessage);
        injectedIndices.push(arrMes.length - 1);
    }

    // Unsparse the array. Adjust injected indices
    const newArrMes = [];
    const newInjectedIndices = [];
    for (let i = 0; i < arrMes.length; i++) {
        if (arrMes[i] !== undefined) {
            newArrMes.push(arrMes[i]);
            if (injectedIndices.includes(i)) {
                newInjectedIndices.push(newArrMes.length - 1);
            }
        }
    }

    arrMes = newArrMes;
    injectedIndices = newInjectedIndices;

    if (main_api !== 'openai') {
        setInContextMessages(arrMes.length - injectedIndices.length, type);
    }

    // Estimate how many unpinned example messages fit in the context
    tokenCount = await getMessagesTokenCount();
    let count_exm_add = 0;
    if (!power_user.pin_examples) {
        for (let example of mesExamplesArray) {
            tokenCount += await getTokenCountAsync(example.replace(/\r/gm, ''));
            examplesString += example;
            if (tokenCount < this_max_context) {
                count_exm_add++;
            } else {
                break;
            }
        }
    }

    let mesSend = [];
    console.debug('calling runGenerate');

    if (isContinue) {
        // Coping mechanism for OAI spacing
        if (main_api === 'openai' && !cyclePrompt.endsWith(' ')) {
            cyclePrompt += oai_settings.continue_postfix;
            continue_mag += oai_settings.continue_postfix;
        }
    }

    const originalType = type;

    if (!dryRun) {
        is_send_press = true;
    }

    let generatedPromptCache = cyclePrompt || '';
    if (generatedPromptCache.length == 0 || type === 'continue') {
        console.debug('generating prompt');
        chatString = '';
        arrMes = arrMes.reverse();
        arrMes.forEach(function (item, i, arr) {
            // OAI doesn't need all of this
            if (main_api === 'openai') {
                return;
            }

            // Cohee: This removes a newline from the end of the last message in the context
            // Last prompt line will add a newline if it's not a continuation
            // In instruct mode it only removes it if wrap is enabled and it's not a quiet generation
            if (i === arrMes.length - 1 && type !== 'continue') {
                if (!isInstruct || (power_user.instruct.wrap && type !== 'quiet')) {
                    item = item.replace(/\n?$/, '');
                }
            }

            mesSend[mesSend.length] = { message: item, extensionPrompts: [] };
        });
    }

    let mesExmString = '';

    function setPromptString() {
        if (main_api == 'openai') {
            return;
        }

        console.debug('--setting Prompt string');
        mesExmString = pinExmString ?? mesExamplesArray.slice(0, count_exm_add).join('');

        if (mesSend.length) {
            mesSend[mesSend.length - 1].message = modifyLastPromptLine(mesSend[mesSend.length - 1].message);
        }
    }

    function modifyLastPromptLine(lastMesString) {
        //#########QUIET PROMPT STUFF PT2##############

        // Add quiet generation prompt at depth 0
        if (quiet_prompt && quiet_prompt.length) {
            // here name1 is forced for all quiet prompts..why?
            const name = name1;
            //checks if we are in instruct, if so, formats the chat as such, otherwise just adds the quiet prompt
            const quietAppend = isInstruct ? formatInstructModeChat(name, quiet_prompt, false, true, '', name1, name2, false) : `\n${quiet_prompt}`;

            //This begins to fix quietPrompts (particularly /sysgen) for instruct
            //previously instruct input sequence was being appended to the last chat message w/o '\n'
            //and no output sequence was added after the input's content.
            //TODO: respect output_sequence vs last_output_sequence settings
            //TODO: decide how to prompt this to clarify who is talking 'Narrator', 'System', etc.
            if (isInstruct) {
                lastMesString += quietAppend; // + power_user.instruct.output_sequence + '\n';
            } else {
                lastMesString += quietAppend;
            }


            // Ross: bailing out early prevents quiet prompts from respecting other instruct prompt toggles
            // for sysgen, SD, and summary this is desireable as it prevents the AI from responding as char..
            // but for idle prompting, we want the flexibility of the other prompt toggles, and to respect them as per settings in the extension
            // need a detection for what the quiet prompt is being asked for...

            // Bail out early?
            if (!isInstruct && !quietToLoud) {
                return lastMesString;
            }
        }


        // Get instruct mode line
        if (isInstruct && !isContinue) {
            const name = (quiet_prompt && !quietToLoud && !isImpersonate) ? (quietName ?? 'System') : (isImpersonate ? name1 : name2);
            const isQuiet = quiet_prompt && type == 'quiet';
            lastMesString += formatInstructModePrompt(name, isImpersonate, promptBias, name1, name2, isQuiet, quietToLoud);
        }

        // Get non-instruct impersonation line
        if (!isInstruct && isImpersonate && !isContinue) {
            const name = name1;
            if (!lastMesString.endsWith('\n')) {
                lastMesString += '\n';
            }
            lastMesString += name + ':';
        }

        // Add character's name
        // Force name append on continue (if not continuing on user message or first message)
        const isContinuingOnFirstMessage = chat.length === 1 && isContinue;
        if (!isInstruct && force_name2 && !isContinuingOnFirstMessage) {
            if (!lastMesString.endsWith('\n')) {
                lastMesString += '\n';
            }
            if (!isContinue || !(chat[chat.length - 1]?.is_user)) {
                lastMesString += `${name2}:`;
            }
        }

        return lastMesString;
    }

    async function checkPromptSize() {
        console.debug('---checking Prompt size');
        setPromptString();
        const jointMessages = mesSend.map((e) => `${e.extensionPrompts.join('')}${e.message}`).join('');
        const prompt = [
            combinedStoryString,
            mesExmString,
            addChatsPreamble(addChatsSeparator(jointMessages)),
            '\n',
            modifyLastPromptLine(''),
            generatedPromptCache,
        ].join('').replace(/\r/gm, '');
        let thisPromptContextSize = await getTokenCountAsync(prompt, power_user.token_padding);

        if (thisPromptContextSize > this_max_context) {        //if the prepared prompt is larger than the max context size...
            if (count_exm_add > 0) {                            // ..and we have example messages..
                count_exm_add--;                            // remove the example messages...
                await checkPromptSize();                            // and try agin...
            } else if (mesSend.length > 0) {                    // if the chat history is longer than 0
                mesSend.shift();                            // remove the first (oldest) chat entry..
                await checkPromptSize();                            // and check size again..
            } else {
                //end
                console.debug(`---mesSend.length = ${mesSend.length}`);
            }
        }
    }

    if (generatedPromptCache.length > 0 && main_api !== 'openai') {
        console.debug('---Generated Prompt Cache length: ' + generatedPromptCache.length);
        await checkPromptSize();
    } else {
        console.debug('---calling setPromptString ' + generatedPromptCache.length);
        setPromptString();
    }

    // For prompt bit itemization
    let mesSendString = '';

    async function getCombinedPrompt(isNegative) {
        // Only return if the guidance scale doesn't exist or the value is 1
        // Also don't return if constructing the neutral prompt
        if (isNegative && !useCfgPrompt) {
            return;
        }

        // OAI has its own prompt manager. No need to do anything here
        if (main_api === 'openai') {
            return '';
        }

        // Deep clone
        let finalMesSend = structuredClone(mesSend);

        if (useCfgPrompt) {
            const cfgPrompt = getCfgPrompt(cfgGuidanceScale, isNegative);
            if (cfgPrompt.value) {
                if (cfgPrompt.depth === 0) {
                    finalMesSend[finalMesSend.length - 1].message +=
                        /\s/.test(finalMesSend[finalMesSend.length - 1].message.slice(-1))
                            ? cfgPrompt.value
                            : ` ${cfgPrompt.value}`;
                } else {
                    // TODO: Make all extension prompts use an array/splice method
                    const lengthDiff = mesSend.length - cfgPrompt.depth;
                    const cfgDepth = lengthDiff >= 0 ? lengthDiff : 0;
                    const cfgMessage = finalMesSend[cfgDepth];
                    if (cfgMessage) {
                        if (!Array.isArray(finalMesSend[cfgDepth].extensionPrompts)) {
                            finalMesSend[cfgDepth].extensionPrompts = [];
                        }
                        finalMesSend[cfgDepth].extensionPrompts.push(`${cfgPrompt.value}\n`);
                    }
                }
            }
        }

        // Add prompt bias after everything else
        // Always run with continue
        if (!isInstruct && !isImpersonate) {
            if (promptBias.trim().length !== 0) {
                finalMesSend[finalMesSend.length - 1].message +=
                    /\s/.test(finalMesSend[finalMesSend.length - 1].message.slice(-1))
                        ? promptBias.trimStart()
                        : ` ${promptBias.trimStart()}`;
            }
        }

        // Flattens the multiple prompt objects to a string.
        const combine = () => {
            // Right now, everything is suffixed with a newline
            mesSendString = finalMesSend.map((e) => `${e.extensionPrompts.join('')}${e.message}`).join('');

            // add a custom dingus (if defined)
            mesSendString = addChatsSeparator(mesSendString);

            // add chat preamble
            mesSendString = addChatsPreamble(mesSendString);

            let combinedPrompt = [
                combinedStoryString,
                mesExmString,
                mesSendString,
                generatedPromptCache,
            ].join('').replace(/\r/gm, '');

            if (power_user.collapse_newlines) {
                combinedPrompt = collapseNewlines(combinedPrompt);
            }

            return combinedPrompt;
        };

        finalMesSend.forEach((item, i) => {
            item.injected = injectedIndices.includes(finalMesSend.length - i - 1);
        });

        let data = {
            api: main_api,
            combinedPrompt: null,
            description,
            personality,
            persona,
            scenario,
            char: name2,
            user: name1,
            worldInfoBefore,
            worldInfoAfter,
            beforeScenarioAnchor,
            afterScenarioAnchor,
            storyString,
            mesExmString,
            mesSendString,
            finalMesSend,
            generatedPromptCache,
            main: system,
            jailbreak,
            naiPreamble: nai_settings.preamble,
        };

        // Before returning the combined prompt, give available context related information to all subscribers.
        await eventSource.emit(event_types.GENERATE_BEFORE_COMBINE_PROMPTS, data);

        // If one or multiple subscribers return a value, forfeit the responsibillity of flattening the context.
        return !data.combinedPrompt ? combine() : data.combinedPrompt;
    }

    let finalPrompt = await getCombinedPrompt(false);

    const eventData = { prompt: finalPrompt, dryRun: dryRun };
    await eventSource.emit(event_types.GENERATE_AFTER_COMBINE_PROMPTS, eventData);
    finalPrompt = eventData.prompt;

    let maxLength = Number(amount_gen); // how many tokens the AI will be requested to generate
    let thisPromptBits = [];

    let generate_data;
    let promptAssembly = null;
    let agentPromptInputs;
    switch (main_api) {
        case 'koboldhorde':
        case 'kobold':
            if (main_api == 'koboldhorde' && horde_settings.auto_adjust_response_length) {
                maxLength = Math.min(maxLength, adjustedParams.maxLength);
                maxLength = Math.max(maxLength, MIN_LENGTH); // prevent validation errors
            }

            generate_data = {
                prompt: finalPrompt,
                gui_settings: true,
                max_length: maxLength,
                max_context_length: max_context,
                api_server: kai_settings.api_server,
            };

            if (kai_settings.preset_settings != 'gui') {
                const isHorde = main_api == 'koboldhorde';
                const presetSettings = koboldai_settings[koboldai_setting_names[kai_settings.preset_settings]];
                const maxContext = (adjustedParams && horde_settings.auto_adjust_context_length) ? adjustedParams.maxContextLength : max_context;
                generate_data = getKoboldGenerationData(finalPrompt, presetSettings, maxLength, maxContext, isHorde, type);
            }
            break;
        case 'textgenerationwebui': {
            const cfgValues = useCfgPrompt ? { guidanceScale: cfgGuidanceScale, negativePrompt: await getCombinedPrompt(true) } : null;
            generate_data = await getTextGenGenerationData(finalPrompt, maxLength, isImpersonate, isContinue, cfgValues, type);
            break;
        }
        case 'novel': {
            const cfgValues = useCfgPrompt ? { guidanceScale: cfgGuidanceScale } : null;
            const presetSettings = novelai_settings[novelai_setting_names[nai_settings.preset_settings_novel]];
            generate_data = getNovelGenerationData(finalPrompt, presetSettings, maxLength, isImpersonate, isContinue, cfgValues, type);
            break;
        }
        case 'openai': {
            const extensionPromptSnapshot = agentMode
                ? await snapshotExtensionPromptsForFrozenRun(extension_prompts)
                : extension_prompts;
            const promptInputs = {
                name2: name2,
                charDescription: description,
                charPersonality: personality,
                scenario: scenario,
                worldInfoBefore,
                worldInfoAfter,
                extensionPrompts: extensionPromptSnapshot,
                bias: promptBias,
                type: type,
                quietPrompt: quiet_prompt,
                quietImage: quietImage,
                cyclePrompt: cyclePrompt,
                systemPromptOverride: system,
                jailbreakPromptOverride: jailbreak,
                messages: oaiMessages,
                messageExamples: oaiMessageExamples,
            };
            let workingInputs = promptInputs;
            if (agentMode) {
                // Sealed after GENERATE_AFTER_DATA; must stay unprojected.
                agentPromptInputs = {
                    ...promptInputs,
                    messageExamples: oaiExampleBlocks.character,
                    worldInfoExamples: { before: oaiExampleBlocks.before, after: oaiExampleBlocks.after },
                    authorsNoteAdditions,
                };
                workingInputs = projectAgentPromptInputs(agentPromptInputs, resolvedAgentContextPolicy);
                // Live {{outlet}} reads globals, which must hold the root's projected WI injections.
                flushWIInjections();
                for (const [key, prompt] of Object.entries(workingInputs.extensionPrompts)) {
                    if (isWorldInfoInjection(key)) {
                        setExtensionPrompt(key, prompt.value, prompt.position, prompt.depth, prompt.scan, prompt.role);
                    }
                }
            }
            const [prompt, counts, toolData, assembly] = await prepareOpenAIMessages({
                ...workingInputs,
                allowToolCalls: canAdvertiseToolCalls,
                agentMode,
                agentSystemPrompt: resolvedAgentSystemPrompt,
                legacyMcpToolRound,
                quietToolRequest,
            }, dryRun);
            generate_data = { prompt, toolData };
            promptAssembly = assembly ? { ...assembly, mcpDiagnostics: legacyMcpToolRound ? legacyMcpContext.diagnostics : [] } : null;

            // TODO: move these side-effects somewhere else, so this switch-case solely sets generate_data
            // counts will return false if the user has not enabled the token breakdown feature
            if (counts) {
                parseTokenCounts(counts, thisPromptBits);
            }

            if (!dryRun) {
                setInContextMessages(openai_messages_count, type);
            }
            break;
        }
    }

    await eventSource.emit(event_types.GENERATE_AFTER_DATA, generate_data, dryRun);

    // Extensions finish their prompt work before the Run takes ownership of its inputs.
    if (agentMode) {
        const context = captureMacroContext();
        context.state.lastGenerationType = type || 'normal';
        const settings = structuredClone(oai_settings);
        const currentPreset = {
            apiId: 'openai',
            name: settings.preset_settings_openai,
            settings: getChatCompletionPreset(settings),
        };
        const currentModelConnection = await buildCurrentModelConnectionSnapshot({
            settings,
            model: getChatCompletionModel(settings),
            secretKey: resolveSecretKey(),
            secretState: secret_state,
        });
        generate_data.frozenRunInputSnapshot = buildFrozenRunInputSnapshot(updateFrozenMacroContext({
            generationType: type,
            promptInputs: agentPromptInputs,
            worldInfoActivation,
            currentPreset,
            currentModelConnection,
        }, context, buildAgentReadOnlyMacros(context, characterFields, characterExamples)));
    }

    if (dryRun) {
        return { generateData: generate_data, promptAssembly };
    }

    if (agentMode) {
        try {
            return await startAgentRunFromGeneratedPrompt({
                type,
                generateData: generate_data,
                jsonSchema,
                profileId: agentProfileId,
                agentContextPolicy: resolvedAgentContextPolicy,
            });
        } finally {
            unblockGeneration(type);
        }
    }

    /**
     * Saves itemized prompt bits and calls streaming or non-streaming generation API.
     * @returns {Promise<void|*|Awaited<*>|String|{fromStream}|string|undefined|Object>}
     * @throws {Error|object} Error with message text, or Error with response JSON (OAI/Horde), or the actual response JSON (novel|textgenerationwebui|kobold)
     */
    async function finishGenerating() {
        if (power_user.console_log_prompts) {
            console.log(generate_data.prompt);
        }

        console.debug('rungenerate calling API');

        showStopButton();

        //set array object for prompt token itemization of this message
        let currentArrayEntry = Number(thisPromptBits.length - 1);
        let additionalPromptStuff = {
            ...thisPromptBits[currentArrayEntry],
            rawPrompt: generate_data.prompt || generate_data.input,
            mesId: getNextMessageId(type),
            allAnchors: '',
            chatInjects: injectedIndices?.map(index => arrMes[arrMes.length - index - 1])?.join('') || '',
            summarizeString: (extension_prompts['1_memory']?.value || ''),
            authorsNoteString: (extension_prompts['2_floating_prompt']?.value || ''),
            smartContextString: (extension_prompts.chromadb?.value || ''),
            chatVectorsString: (extension_prompts['3_vectors']?.value || ''),
            dataBankVectorsString: (extension_prompts['4_vectors_data_bank']?.value || ''),
            worldInfoString: worldInfoString,
            storyString: storyString,
            beforeScenarioAnchor: beforeScenarioAnchor,
            afterScenarioAnchor: afterScenarioAnchor,
            examplesString: examplesString,
            mesSendString: mesSendString,
            generatedPromptCache: generatedPromptCache,
            promptBias: promptBias,
            finalPrompt: finalPrompt,
            charDescription: description,
            charPersonality: personality,
            scenarioText: scenario,
            this_max_context: this_max_context,
            padding: power_user.token_padding,
            main_api: main_api,
            instruction: main_api !== 'openai' && power_user.sysprompt.enabled ? substituteParams(power_user.prefer_character_prompt && system ? system : power_user.sysprompt.content) : '',
            userPersona: (power_user.persona_description_position == persona_description_positions.IN_PROMPT ? (persona || '') : ''),
            tokenizer: getFriendlyTokenizerName(main_api).tokenizerName || '',
            presetName: getPresetManager()?.getSelectedPresetName() || '',
            messagesCount: main_api !== 'openai' ? mesSend.length : oaiMessages.length,
            examplesCount: main_api !== 'openai' ? (pinExmString ? mesExamplesArray.length : count_exm_add) : oaiMessageExamples.length,
        };

        upsertItemizedPromptRecord(additionalPromptStuff);

        if (isStreamingEnabled() && type !== 'quiet') {
            continue_mag = promptReasoning.removePrefix(continue_mag);
            streamingProcessor = new StreamingProcessor(type, force_name2, generation_started, continue_mag, promptReasoning);
            if (isContinue) {
                // Save reply does add cycle text to the prompt, so it's not needed here
                streamingProcessor.firstMessageText = '';
            }

            streamingProcessor.generator = await sendStreamingRequest(type, generate_data, { jsonSchema, allowToolCalls: canAdvertiseToolCalls, legacyMcpToolRound });

            hideSwipeButtons();
            let getMessage = await streamingProcessor.generate();
            let messageChunk = cleanUpMessage({
                getMessage: getMessage,
                isImpersonate: isImpersonate,
                isContinue: isContinue,
                displayIncompleteSentences: false,
            });

            if (isContinue) {
                getMessage = continue_mag + getMessage;
            }

            const isStreamFinished = streamingProcessor && !streamingProcessor.isStopped && streamingProcessor.isFinished;
            const isStreamWithToolCalls = streamingProcessor && Array.isArray(streamingProcessor.toolCalls) && streamingProcessor.toolCalls.length;
            if (canPerformToolCalls && isStreamFinished && isStreamWithToolCalls) {
                const hasToolCalls = ToolManager.hasToolCalls(streamingProcessor.toolCalls);
                const toolTurnOwner = chat[streamingProcessor.messageId];
                const reasoningContent = streamingProcessor?.reasoningHandler?.reasoning || null;
                if (hasToolCalls) {
                    await streamingProcessor.finalizeIntermediaryMessage(streamingProcessor.messageId, getMessage, { unlockUI: false, hasToolCalls });
                }
                let invocationResult;
                try {
                    invocationResult = await ToolManager.invokeFunctionTools(streamingProcessor.toolCalls, {
                        reasoningText: reasoningContent,
                        onCallsReady: calls => showPendingToolCalls(toolTurnOwner, calls),
                        onInvocationComplete: invocation => completePendingToolCall(toolTurnOwner, invocation),
                        toolResolver: legacyMcpToolRound ? name => legacyMcpToolRound.resolveTool(name) : null,
                        signal: abortController.signal,
                    });
                } catch (error) {
                    handleToolInvocationError(toolTurnOwner, error);
                    throw error;
                }
                const shouldStopGeneration = !invocationResult.invocations.length || invocationResult.stealthCalls.length;
                if (hasToolCalls) {
                    if (shouldStopGeneration) {
                        clearPendingToolCalls(toolTurnOwner);
                        if (Array.isArray(invocationResult.errors) && invocationResult.errors.length) {
                            ToolManager.showToolCallError(invocationResult.errors);
                        }
                        unblockGeneration(type);
                        streamingProcessor = null;
                        return;
                    }

                    streamingProcessor = null;
                    depth = depth + 1;
                    try {
                        await ToolManager.saveFunctionToolTurn(invocationResult.invocations, toolTurnOwner, reasoningContent);
                    } finally {
                        clearPendingToolCalls(toolTurnOwner);
                    }
                    if (abortController.signal.aborted) {
                        unblockGeneration(type);
                        return;
                    }
                    return Generate('normal', { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage, quietName, depth, [LEGACY_MCP_GENERATION_CONTEXT]: legacyMcpContext }, dryRun);
                }
            }

            if (isStreamFinished) {
                await streamingProcessor.onFinishStreaming(streamingProcessor.messageId, getMessage);
                streamingProcessor = null;
                triggerAutoContinue(messageChunk, isImpersonate);
                return Object.defineProperties(new String(getMessage), {
                    'messageChunk': { value: messageChunk },
                    'fromStream': { value: true },
                });
            }
        } else {
            return await sendGenerationRequest(type, generate_data, { jsonSchema, allowToolCalls: canAdvertiseToolCalls, legacyMcpToolRound });
        }
    }

    return finishGenerating().then(onSuccess, onError);

    /**
     * Handles the successful response from the generation API.
     * @param data
     * @returns {Promise<String|{fromStream}|*|string|string|void|Awaited<*>|undefined>}
     * @throws {Error} Throws an error if the response data contains an error message
     */
    async function onSuccess(data) {
        if (!data) return;

        if (data?.fromStream) {
            return data;
        }

        let messageChunk = '';
        /** @type {ChatMessage|null} */
        let toolTurnOwner = null;

        // if an error was returned in data (textgenwebui), show it and throw it
        if (data.error) {
            unblockGeneration(type);

            if (data?.response) {
                toastr.error(data.response, t`API Error`, { preventDuplicates: true });
            }
            throw new Error(data?.response);
        }

        if (quietToolRequest) {
            return await quietToolRequest.onResponse(data, abortController.signal);
        }

        if (jsonSchema) {
            unblockGeneration(type);
            return extractJsonFromData(data, {
                ...data.requestContext,
                returnInvalidJson: jsonSchema.returnInvalid ?? false,
            });
        }

        //const getData = await response.json();
        const requestContext = data.requestContext;
        let getMessage = extractMessageFromData(data, requestContext?.mainApi);
        let title = extractTitleFromData(data);
        let reasoning = extractReasoningFromData(data, requestContext);
        const toolReasoning = extractReasoningFromData(data, {
            ...requestContext,
            ignoreShowThoughts: true,
        });
        let imageUrls = extractImagesFromData(data, requestContext);
        const reasoningSignature = extractReasoningSignatureFromData(data, requestContext);
        const native = data?.choices?.[0]?.message?.native ?? null;
        const promptCache = getPromptCacheUsage({ ...data?.timings, ...data?.usage });
        const hasToolCalls = canPerformToolCalls && ToolManager.hasToolCalls(data);
        const providerReplay = requestContext ? { ...requestContext, text: getMessage } : null;
        kobold_horde_model = title;

        const swipes = extractMultiSwipes(data, type);

        messageChunk = cleanUpMessage({
            getMessage: getMessage,
            isImpersonate: isImpersonate,
            isContinue: isContinue,
            displayIncompleteSentences: false,
        });


        reasoning = getRegexedString(reasoning, regex_placement.REASONING);

        if (power_user.trim_spaces) {
            reasoning = reasoning.trim();
        }

        if (isContinue) {
            continue_mag = promptReasoning.removePrefix(continue_mag);
            getMessage = continue_mag + getMessage;
        }

        //Formating
        const displayIncomplete = type === 'quiet' && !quietToLoud;
        getMessage = cleanUpMessage({
            getMessage: getMessage,
            isImpersonate: isImpersonate,
            isContinue: isContinue,
            displayIncompleteSentences: displayIncomplete,
        });

        if (isImpersonate) {
            $('#send_textarea').val(getMessage)[0].dispatchEvent(new Event('input', { bubbles: true }));
            await eventSource.emit(event_types.IMPERSONATE_READY, getMessage);
        } else if (type == 'quiet') {
            unblockGeneration(type);
            return getMessage;
        } else {
            // Without streaming we'll be having a full message on continuation. Treat it as a last chunk.
            if (originalType !== 'continue') {
                ({ type, getMessage } = await saveReply({ type, getMessage, title, swipes, reasoning, imageUrls, reasoningSignature, native, providerReplay, promptCache, hasToolCalls }));
            } else {
                ({ type, getMessage } = await saveReply({ type: 'appendFinal', getMessage, title, swipes, reasoning: promptReasoning.formatContinuation(reasoning), imageUrls, reasoningSignature, native, providerReplay, promptCache, hasToolCalls }));
            }
            toolTurnOwner = chat.at(-1) ?? null;

            // This relies on `saveReply` having been called to add the message to the chat, so it must be last.
            parseAndSaveLogprobs(data, continue_mag);
        }

        if (canPerformToolCalls) {
            let invocationResult;
            try {
                invocationResult = await ToolManager.invokeFunctionTools(data, {
                    reasoningText: reasoning,
                    onCallsReady: calls => showPendingToolCalls(toolTurnOwner, calls),
                    onInvocationComplete: invocation => completePendingToolCall(toolTurnOwner, invocation),
                    toolResolver: legacyMcpToolRound ? name => legacyMcpToolRound.resolveTool(name) : null,
                    signal: abortController.signal,
                });
            } catch (error) {
                handleToolInvocationError(toolTurnOwner, error);
                throw error;
            }
            const shouldStopGeneration = !invocationResult.invocations.length || invocationResult.stealthCalls.length;
            if (hasToolCalls) {
                if (shouldStopGeneration) {
                    clearPendingToolCalls(toolTurnOwner);
                    if (Array.isArray(invocationResult.errors) && invocationResult.errors.length) {
                        ToolManager.showToolCallError(invocationResult.errors);
                    }
                    unblockGeneration(type);
                    return;
                }

                depth = depth + 1;
                try {
                    await ToolManager.saveFunctionToolTurn(invocationResult.invocations, toolTurnOwner, toolReasoning);
                } finally {
                    clearPendingToolCalls(toolTurnOwner);
                }
                if (abortController.signal.aborted) {
                    unblockGeneration(type);
                    return;
                }
                return Generate('normal', { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage, quietName, depth, [LEGACY_MCP_GENERATION_CONTEXT]: legacyMcpContext }, dryRun);
            }
        }

        if (type !== 'quiet') {
            playMessageSound();
        }

        const isAborted = abortController && abortController.signal.aborted;
        if (!isAborted && power_user.auto_swipe && generatedTextFiltered(getMessage)) {
            is_send_press = false;
            return await swipe(null, SWIPE_DIRECTION.RIGHT, { source: SWIPE_SOURCE.AUTO_SWIPE, repeated: true, forceMesId: chat.length - 1 });
        }

        console.debug('Chat save called by /Generate');
        await saveChatConditional(isImpersonate
            ? CHAT_COMMIT_REASON.MUTATION
            : CHAT_COMMIT_REASON.GENERATION_CHECKPOINT);
        unblockGeneration(type);
        streamingProcessor = null;

        if (type !== 'quiet') {
            triggerAutoContinue(messageChunk, isImpersonate);
        }

        // Don't break the API chain that expects a single string in return
        return Object.defineProperty(new String(getMessage), 'messageChunk', { value: messageChunk });
    }

    /**
     * Exception handler for finishGenerating
     * @param {Error|object} exception Error or response JSON
     * @throws {Error|object} Re-throws the exception
     */
    function onError(exception) {
        // if the response JSON was thrown (novel|textgenerationwebui|kobold), show the error message
        if (typeof exception?.error?.message === 'string') {
            toastr.error(exception.error.message, t`Text generation error`, { timeOut: 10000, extendedTimeOut: 20000 });
        }

        unblockGeneration(type);
        console.log(exception);
        streamingProcessor = null;
        throw exception;
    }
}

async function startAgentRunFromGeneratedPrompt({ type, generateData, jsonSchema, profileId, agentContextPolicy }) {
    if (main_api !== 'openai') {
        throw new Error('agent.chat_completion_required: Agent Mode currently requires the OpenAI/chat-completion path');
    }

    if (!agentContextPolicy) {
        throw new Error('agent.context_policy_required: Agent Mode did not resolve an Agent context policy');
    }

    const frozenRunInputSnapshot = normalizeFrozenRunInputSnapshot(generateData.frozenRunInputSnapshot);
    const currentPromptSnapshotSeed = createCurrentPromptSnapshotSeed(generateData, {
        generationType: type,
        contextPolicy: agentContextPolicy,
        jsonSchema,
        frozenRunInputSnapshot,
    });
    const promptAssembly = await prepareAgentPromptAssemblyForRun({
        generationType: type,
        profileId,
        frozenRunInputSnapshot,
        jsonSchema,
    });
    let payload;
    let snapshotInputs;
    let generationIntent;
    let runFrozenRunInputSnapshot = frozenRunInputSnapshot;

    if (promptAssembly.mode === 'currentPromptSnapshot') {
        const prepared = await prepareCurrentPromptPayload({
            currentPromptSnapshotSeed,
            frozenRunInputSnapshot,
        });
        payload = prepared.payload;
        snapshotInputs = prepared.snapshotInputs;
        generationIntent = {
            ...prepared.generationIntent,
            source: 'legacy-generate-live-handoff',
            contextPolicy: agentContextPolicy,
        };
    } else if (promptAssembly.mode === 'frontendPromptAssembly') {
        const assembled = await buildPromptAssemblyPayload(promptAssembly.request);
        payload = assembled.payload;
        snapshotInputs = assembled.snapshotInputs;
        runFrozenRunInputSnapshot = assembled.frozenRunInputSnapshot;
        generationIntent = {
            ...assembled.generationIntent,
            parentSource: 'legacy-generate-live-handoff',
            contextPolicy: snapshotInputs.contextPolicy,
            promptAssembly: promptAssembly.assembly,
        };
    } else {
        throw new Error('agent.prompt_assembly_mode_invalid: prepare_agent_prompt_assembly returned an unsupported mode');
    }

    // Extensions finish editing the provider payload before it becomes canonical Agent input.
    await eventSource.emit(event_types.CHAT_COMPLETION_SETTINGS_READY, payload);
    const promptSnapshot = createAgentPromptSnapshot(payload, snapshotInputs);

    return startAndWaitForAgentRun({
        generationType: type,
        profileId,
        promptSnapshot,
        frozenRunInputSnapshot: runFrozenRunInputSnapshot,
        generationIntent,
        options: { presentation: 'foreground' },
    });
}

async function prepareAgentPromptAssemblyForRun(input) {
    const agentApi = requireAgentPromptAssemblyApi();
    return agentApi.prepare(input);
}

function requireAgentPromptAssemblyApi() {
    const promptAssemblyApi = window.__TAURITAVERN__?.api?.agent?.promptAssembly;
    if (!promptAssemblyApi || typeof promptAssemblyApi.prepare !== 'function') {
        throw new Error('agent.prompt_assembly_api_unavailable: TauriTavern Agent prompt assembly API is unavailable');
    }
    return promptAssemblyApi;
}

export async function hydrateChatMessageSwipes(messageId) {
    const message = chat[messageId];
    if (!message) return false;
    if (message.tt_swipe_cold) {
        try {
            await hydrateMessageSwipes(message);
        } catch (error) {
            if (chat[messageId] !== message) return false;
            toastr.error(t`Could not load this message's swipes.`, t`Swipe Load Failed`);
            throw error;
        }
    }
    return chat[messageId] === message;
}

async function cleanupDeletedMessageStates(messages, saved) {
    try {
        if (selected_group || this_chid === undefined) return;
        if (!messages.some(message => message.tt_swipe_cold || collectAgentPersistStateIdsFromMessage(message).length)) return;
        const chatRef = getActiveChatSnapshot().ref;
        const [ids] = await Promise.all([
            collectDeletedAgentStateIds(messages),
            saved ?? flushDebouncedChatSave(),
        ]);
        await pruneAgentPersistentStatesAfterDeletion(ids, chatRef);
    } catch (error) {
        console.warn('Skipped persistent-state cleanup for deleted messages', error);
    }
}

async function collectDeletedAgentStateIds(messages) {
    const ids = [];
    for (const message of messages) {
        ids.push(...collectAgentPersistStateIdsFromMessage(message));
        if (message.tt_swipe_cold) {
            try {
                const original = await readColdSwipeRecord(message.tt_swipe_cold);
                ids.push(...collectAgentPersistStateIdsFromMessage(original));
            } catch (error) {
                // State-file cleanup is ancillary to deleting the message; the chat save still validates its remaining cold records.
                console.warn('Skipped persistent-state cleanup for a deleted cold message', error);
            }
        }
    }
    return ids;
}

function collectAgentPersistStateIdsFromMessage(message) {
    const ids = [];
    collectAgentPersistStateIdFromExtra(message?.extra, ids);
    if (Array.isArray(message?.swipe_info)) {
        for (const swipe of message.swipe_info) {
            collectAgentPersistStateIdFromExtra(swipe?.extra, ids);
        }
    }
    return ids;
}

function collectAgentPersistStateIdsFromExtra(extra) {
    const ids = [];
    collectAgentPersistStateIdFromExtra(extra, ids);
    return ids;
}

function collectAgentPersistStateIdFromExtra(extra, ids) {
    const stateId = extra?.tauritavern?.agent?.persistStateId;
    if (typeof stateId === 'string' && stateId.trim()) {
        ids.push(stateId.trim());
    }
}

async function pruneAgentPersistentStatesAfterDeletion(deletedStateIds, chatRef) {
    if (!Array.isArray(deletedStateIds) || deletedStateIds.length === 0) {
        return;
    }
    const candidateStateIds = Array.from(new Set(deletedStateIds));
    if (!chatRef && (selected_group || this_chid === undefined)) {
        return;
    }

    const agentApi = window.__TAURITAVERN__?.api?.agent;
    if (!agentApi || typeof agentApi.pruneChatPersistentStates !== 'function') {
        return;
    }
    await agentApi.pruneChatPersistentStates({ candidateStateIds, chatRef });
}

export function stopGeneration() {
    let stopped = false;
    if (hasActiveAgentRun()) {
        void cancelActiveAgentRun().catch((error) => {
            toastr.error(agentErrorMessage(error), t`Agent Mode`);
            queueMicrotask(() => {
                throw error;
            });
        });
        hideStopButton();
        stopped = true;
    }
    if (streamingProcessor) {
        streamingProcessor.onStopStreaming();
        stopped = true;
    }
    if (abortController) {
        abortController.abort('Clicked stop button');
        hideStopButton();
        stopped = true;
    }
    eventSource.emit(event_types.GENERATION_STOPPED);
    return stopped;
}

async function doChatInject(messages, isContinue) {
    const injectedMessages = [];
    let totalInsertedMessages = 0;
    messages.reverse();

    for (const i of getInChatInjectionDepths(extension_prompts)) {
        // Order of priority (most important go lower)
        const roles = [extension_prompt_roles.SYSTEM, extension_prompt_roles.USER, extension_prompt_roles.ASSISTANT];
        const names = {
            [extension_prompt_roles.SYSTEM]: '',
            [extension_prompt_roles.USER]: name1,
            [extension_prompt_roles.ASSISTANT]: name2,
        };
        const roleMessages = [];
        const separator = '\n';
        const wrap = false;

        for (const role of roles) {
            const extensionPrompt = String(await getExtensionPrompt(extension_prompt_types.IN_CHAT, i, separator, role, wrap)).trimStart();
            const isNarrator = role === extension_prompt_roles.SYSTEM;
            const isUser = role === extension_prompt_roles.USER;
            const name = names[role];

            if (extensionPrompt) {
                roleMessages.push({
                    name: name,
                    is_user: isUser,
                    mes: extensionPrompt,
                    extra: {
                        type: isNarrator ? system_message_types.NARRATOR : null,
                    },
                });
            }
        }

        if (roleMessages.length) {
            const depth = isContinue && i === 0 ? 1 : i;
            const injectIdx = Math.min(depth + totalInsertedMessages, messages.length);
            messages.splice(injectIdx, 0, ...roleMessages);
            totalInsertedMessages += roleMessages.length;
            injectedMessages.push(...roleMessages);
        }
    }

    const injectedIndices = injectedMessages.map(msg => messages.indexOf(msg));
    messages.reverse();
    return injectedIndices;
}

function flushWIInjections() {
    for (const key of Object.keys(extension_prompts)) {
        if (isWorldInfoInjection(key)) {
            delete extension_prompts[key];
        }
    }
}

function unblockGeneration(type) {
    // Don't unblock if a parallel stream is still running
    if (type === 'quiet' && streamingProcessor && !streamingProcessor.isFinished) {
        return;
    }

    is_send_press = false;
    activateSendButtons();
    setGenerationProgress(0);
    flushEphemeralStoppingStrings();
    flushWIInjections();
}

export function getNextMessageId(type) {
    return type == 'swipe' ? chat.length - 1 : chat.length;
}

export function shouldAutoContinue(messageChunk, isImpersonate) {
    if (!power_user.auto_continue.enabled) {
        console.debug('Auto-continue is disabled by user.');
        return false;
    }

    if (typeof messageChunk !== 'string') {
        console.debug('Not triggering auto-continue because message chunk is not a string');
        return false;
    }

    if (isImpersonate) {
        console.log('Continue for impersonation is not implemented yet');
        return false;
    }

    if (is_send_press) {
        console.debug('Auto-continue is disabled because a message is currently being sent.');
        return false;
    }

    if (abortController && abortController.signal.aborted) {
        console.debug('Auto-continue is not triggered because the generation was stopped.');
        return false;
    }

    if (power_user.auto_continue.target_length <= 0) {
        console.log('Auto-continue target length is 0, not triggering auto-continue');
        return false;
    }

    if (main_api === 'openai' && !power_user.auto_continue.allow_chat_completions) {
        console.log('Auto-continue for OpenAI is disabled by user.');
        return false;
    }

    const textareaText = String($('#send_textarea').val());
    const USABLE_LENGTH = 5;

    if (textareaText.length > 0) {
        console.log('Not triggering auto-continue because user input is not empty');
        return false;
    }

    if (messageChunk.trim().length > USABLE_LENGTH && chat.length) {
        const lastMessage = chat[chat.length - 1];
        const messageLength = getTokenCount(lastMessage.mes);
        const shouldAutoContinue = messageLength < power_user.auto_continue.target_length;

        if (shouldAutoContinue) {
            console.log(`Triggering auto-continue. Message tokens: ${messageLength}. Target tokens: ${power_user.auto_continue.target_length}. Message chunk: ${messageChunk}`);
            return true;
        } else {
            console.log(`Not triggering auto-continue. Message tokens: ${messageLength}. Target tokens: ${power_user.auto_continue.target_length}`);
            return false;
        }
    } else {
        console.log('Last generated chunk was empty, not triggering auto-continue');
        return false;
    }
}

export function triggerAutoContinue(messageChunk, isImpersonate) {
    if (selected_group) {
        console.debug('Auto-continue is disabled for group chat');
        return;
    }

    if (shouldAutoContinue(messageChunk, isImpersonate)) {
        $('#option_continue').trigger('click');
    }
}

export function getBiasStrings(textareaText, type) {
    if (type == 'impersonate' || type == 'continue') {
        return { messageBias: '', promptBias: '', isUserPromptBias: false };
    }

    let promptBias = '';
    let messageBias = extractMessageBias(textareaText);

    // If user input is not provided, retrieve the bias of the most recent relevant message
    if (!textareaText) {
        for (let i = chat.length - 1; i >= 0; i--) {
            const mes = chat[i];
            if (type === 'swipe' && chat.length - 1 === i) {
                continue;
            }
            if (mes && (mes.is_user || mes.is_system || mes.extra?.type === system_message_types.NARRATOR)) {
                if (mes.extra?.bias?.trim()?.length > 0) {
                    promptBias = mes.extra.bias;
                }
                break;
            }
        }
    }

    promptBias = messageBias || promptBias || power_user.user_prompt_bias || '';
    const isUserPromptBias = promptBias === power_user.user_prompt_bias;

    // Substitute params for everything
    messageBias = substituteParams(messageBias);
    promptBias = substituteParams(promptBias);

    return { messageBias, promptBias, isUserPromptBias };
}

function formatMessageHistoryItem(chatItem, isInstruct, forceOutputSequence) {
    const isNarratorType = chatItem?.extra?.type === system_message_types.NARRATOR;
    const characterName = chatItem?.name ? chatItem.name : name2;
    const itemName = chatItem.is_user ? chatItem.name : characterName;
    const shouldPrependName = !isNarratorType;

    // If this symbol flag is set, completely ignore the message.
    // This can be used to hide messages without affecting the number of messages in the chat.
    if (chatItem.extra?.[IGNORE_SYMBOL]) {
        return '';
    }

    // Don't include a name if it's empty
    let textResult = chatItem?.name && shouldPrependName ? `${itemName}: ${chatItem.mes}\n` : `${chatItem.mes}\n`;

    if (isInstruct) {
        textResult = formatInstructModeChat(itemName, chatItem.mes, chatItem.is_user, isNarratorType, chatItem.force_avatar, name1, name2, forceOutputSequence);
    }

    return textResult;
}

export function removeMacros(str) {
    return (str ?? '').replace(/\{\{[\s\S]*?\}\}/gm, '').trim();
}

export async function sendMessageAsUser(messageText, messageBias, insertAt = null, compact = false, name = name1, avatar = user_avatar, commitReason = CHAT_COMMIT_REASON.MUTATION) {
    messageText = getRegexedString(messageText, regex_placement.USER_INPUT);

    const message = {
        name: name,
        is_user: true,
        is_system: false,
        send_date: getMessageTimeStamp(),
        mes: substituteParams(messageText),
        extra: {
            isSmallSys: compact,
        },
    };

    if (power_user.message_token_count_enabled) {
        message.extra.token_count = await getTokenCountAsync(message.mes, 0);
    }

    // Lock user avatar to a persona.
    if (avatar in power_user.personas) {
        message.force_avatar = getThumbnailUrl('persona', avatar);
    }

    if (messageBias) {
        message.extra.bias = messageBias;
        message.mes = removeMacros(message.mes);
    }

    await populateFileAttachment(message);
    statMesProcess(message, 'user', characters, this_chid, '');

    chat_metadata.tainted = true;

    if (typeof insertAt === 'number' && insertAt >= 0 && insertAt <= chat.length) {
        await withChatSurfaceStructureMutation(async () => {
            chat.splice(insertAt, 0, message);
            await saveChatConditional(commitReason);
            await eventSource.emit(event_types.MESSAGE_SENT, insertAt);
            await reloadCurrentChat();
        });
        await finalizeMessageContent(insertAt, event_types.USER_MESSAGE_RENDERED);
    } else {
        let chat_id;
        await withChatSurfaceStructureMutation(async () => {
            chat.push(message);
            await saveChatConditional(commitReason);
            chat_id = (chat.length - 1);
            await eventSource.emit(event_types.MESSAGE_SENT, chat_id);
            addOneMessage(message);
        });
        await finalizeMessageContent(chat_id, event_types.USER_MESSAGE_RENDERED);
    }

    return message;
}

export function sendMessageAsUserAtProviderBarrier(messageText, messageBias) {
    return sendMessageAsUser(
        messageText,
        messageBias,
        null,
        false,
        name1,
        user_avatar,
        CHAT_COMMIT_REASON.PROVIDER_BARRIER,
    );
}

export function getMaxContextTokens() {
    if (main_api == 'kobold' || main_api == 'koboldhorde' || main_api == 'textgenerationwebui') {
        return max_context;
    }
    if (main_api == 'novel') {
        let this_max_context = Number(max_context);
        if (nai_settings.model_novel.includes('clio')) {
            this_max_context = Math.min(max_context, 8192);
        }
        if (nai_settings.model_novel.includes('kayra')) {
            this_max_context = Math.min(max_context, 8192);

            const subscriptionLimit = getKayraMaxContextTokens();
            if (typeof subscriptionLimit === 'number' && this_max_context > subscriptionLimit) {
                this_max_context = subscriptionLimit;
                console.log(`NovelAI subscription limit reached. Max context size is now ${this_max_context}`);
            }
        }
        if (nai_settings.model_novel.includes('erato')) {
            // subscriber limits coming soon
            this_max_context = Math.min(max_context, 8192);

            // Added special tokens and whatnot
            this_max_context -= 10;
        }
        return this_max_context;
    }
    if (main_api == 'openai') {
        return oai_settings.openai_max_context;
    }
    return 1487;
}

export function getMaxResponseTokens() {
    if (main_api == 'kobold' || main_api == 'koboldhorde' || main_api == 'textgenerationwebui' || main_api == 'novel') {
        return amount_gen;
    }
    if (main_api == 'openai') {
        return oai_settings.openai_max_tokens;
    }
    return 0;
}

export function getMaxPromptTokens(overrideResponseLength = null) {
    if (typeof overrideResponseLength !== 'number' || overrideResponseLength <= 0 || isNaN(overrideResponseLength)) {
        overrideResponseLength = null;
    }

    return getMaxContextTokens() - (overrideResponseLength || getMaxResponseTokens());
}

function parseTokenCounts(counts, thisPromptBits) {
    /**
     * @param {any[]} numbers
     */
    function getSum(...numbers) {
        return numbers.map(x => Number(x)).filter(x => !Number.isNaN(x)).reduce((acc, val) => acc + val, 0);
    }
    const total = getSum(Object.values(counts));

    thisPromptBits.push({
        oaiStartTokens: (counts?.start + counts?.controlPrompts) || 0,
        oaiPromptTokens: getSum(counts?.prompt, counts?.charDescription, counts?.charPersonality, counts?.scenario) || 0,
        oaiBiasTokens: counts?.bias || 0,
        oaiNudgeTokens: counts?.nudge || 0,
        oaiJailbreakTokens: counts?.jailbreak || 0,
        oaiImpersonateTokens: counts?.impersonate || 0,
        oaiExamplesTokens: (counts?.dialogueExamples + counts?.examples) || 0,
        oaiConversationTokens: (counts?.conversation + counts?.chatHistory) || 0,
        oaiNsfwTokens: counts?.nsfw || 0,
        oaiMainTokens: counts?.main || 0,
        oaiTotalTokens: total,
    });
}

function addChatsPreamble(mesSendString) {
    return main_api === 'novel'
        ? substituteParams(nai_settings.preamble) + '\n' + mesSendString
        : mesSendString;
}

function addChatsSeparator(mesSendString) {
    if (power_user.context.chat_start) {
        return substituteParams(power_user.context.chat_start + '\n') + mesSendString;
    } else {
        return mesSendString;
    }
}

export async function duplicateCharacter({ avatar = null, silent = false } = {}) {
    // Determine the character to duplicate
    let targetAvatar;
    if (avatar) {
        const character = characters.find(c => c.avatar === avatar);
        if (!character) {
            toastr.warning(t`Character not found: ${avatar}`);
            return '';
        }
        targetAvatar = avatar;
    } else {
        if (this_chid === undefined || !characters[this_chid]) {
            toastr.warning(t`You must first select a character to duplicate!`);
            return '';
        }
        targetAvatar = characters[this_chid].avatar;
    }

    // Show confirmation unless silent
    if (!silent) {
        const confirmMessage = $(await renderTemplateAsync('duplicateConfirm'));
        const confirm = await callGenericPopup(confirmMessage, POPUP_TYPE.CONFIRM, '', { label: confirmMessage.find('h3')[0] });

        if (!confirm) {
            console.log('User cancelled duplication');
            return '';
        }
    }

    const body = { avatar_url: targetAvatar };
    const response = await fetch('/api/characters/duplicate', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        toastr.error(t`Failed to duplicate character`);
        return '';
    }

    toastr.success(t`Character Duplicated`);
    const data = await response.json();
    await eventSource.emit(event_types.CHARACTER_DUPLICATED, { oldAvatar: targetAvatar, newAvatar: data.path });
    await getCharacters();

    return data.path;
}

function setInContextMessages(msgInContextCount, type) {
    if (type === 'swipe' || type === 'regenerate' || type === 'continue') {
        msgInContextCount++;
    }

    // Update last id to chat. No metadata save on purpose, gets hopefully saved via another call
    const lastMessageId = Math.max(0, chat.length - msgInContextCount);
    chat_metadata.lastInContextMessageId = lastMessageId;
    if (!syncLastInContextMessageMarker() && !shouldUseBoundedChatSurface()) {
        const firstMessageId = getFirstDisplayedMessageId();
        chatElement.find(`.mes[mesid="${firstMessageId}"]`).addClass('lastInContext');
    }
}

function syncLastInContextMessageMarker() {
    chatElement.find('.mes').removeClass('lastInContext');
    const messageId = chat_metadata.lastInContextMessageId;
    if (!Number.isInteger(messageId)) {
        return false;
    }
    const marker = chatElement.find(`.mes[mesid="${messageId}"]`);
    marker.addClass('lastInContext');
    return marker.length > 0;
}

export async function sendGenerationRequest(type, data, options = {}) {
    if (main_api === 'openai') {
        return await sendOpenAIRequest(type, data.prompt, abortController.signal, { ...options, toolData: data.toolData });
    }

    if (main_api === 'koboldhorde') {
        return await generateHorde(data.prompt, data, abortController.signal, true);
    }

    const response = await fetch(getGenerateUrl(main_api), {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify(data),
        signal: abortController.signal,
    });

    if (!response.ok) {
        throw await response.json();
    }

    return await response.json();
}

export async function sendStreamingRequest(type, data, options = {}) {
    if (abortController?.signal?.aborted) {
        throw new Error('Generation was aborted.');
    }

    switch (main_api) {
        case 'openai':
            return await sendOpenAIRequest(type, data.prompt, streamingProcessor.abortController.signal, { ...options, toolData: data.toolData });
        case 'textgenerationwebui':
            return await generateTextGenWithStreaming(data, streamingProcessor.abortController.signal);
        case 'novel':
            return await generateNovelWithStreaming(data, streamingProcessor.abortController.signal);
        case 'kobold':
            return await generateKoboldWithStreaming(data, streamingProcessor.abortController.signal);
        default:
            throw new Error('Streaming is enabled, but the current API does not support streaming.');
    }
}

export function getGenerateUrl(api) {
    switch (api) {
        case 'kobold':
            return '/api/backends/kobold/generate';
        case 'koboldhorde':
            return '/api/backends/koboldhorde/generate';
        case 'textgenerationwebui':
            return '/api/backends/text-completions/generate';
        case 'novel':
            return '/api/novelai/generate';
        default:
            throw new Error(`Unknown API: ${api}`);
    }
}

function extractTitleFromData(data) {
    if (main_api == 'koboldhorde') {
        return data.workerName;
    }

    return undefined;
}

function extractImagesFromData(data, { mainApi = null, chatCompletionSource = null } = {}) {
    switch (mainApi ?? main_api) {
        case 'openai': {
            switch (chatCompletionSource ?? oai_settings.chat_completion_source) {
                case chat_completion_sources.VERTEXAI:
                case chat_completion_sources.MAKERSUITE: {
                    const inlineData = data?.responseContent?.parts?.filter(x => x.inlineData && !x.thought)?.map(x => x.inlineData);
                    if (Array.isArray(inlineData) && inlineData.length > 0) {
                        return inlineData.map(x => `data:${x.mimeType};base64,${x.data}`).filter(isDataURL);
                    }
                } break;
                case chat_completion_sources.OPENROUTER: {
                    const imageUrl = data?.choices[0]?.message?.images?.filter(x => x.type === 'image_url')?.map(x => x?.image_url?.url);
                    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
                        return imageUrl.filter(isDataURL);
                    }
                    // TODO: Handle remote URLs
                }
            }
        } break;
    }

    return [];
}

function parseAndSaveLogprobs(data, continueFrom) {
    /** @type {import('./scripts/logprobs.js').TokenLogprobs[] | null} */
    let logprobs = null;

    switch (main_api) {
        case 'novel':
            // parser only handles one token/logprob pair at a time
            logprobs = data.logprobs?.map(parseNovelAILogprobs) || null;
            break;
        case 'openai':
            // OAI and other chat completion APIs must handle this earlier in
            // `sendOpenAIRequest`. `data` for these APIs is just a string with
            // the text of the generated message, logprobs are not included.
            return;
        case 'textgenerationwebui':
            switch (textgen_settings.type) {
                case textgen_types.LLAMACPP: {
                    logprobs = data?.completion_probabilities?.map(x => parseTextgenLogprobs(x.content, [x])) || null;
                } break;
                case textgen_types.KOBOLDCPP:
                case textgen_types.VLLM:
                case textgen_types.INFERMATICAI:
                case textgen_types.APHRODITE:
                case textgen_types.MANCER:
                case textgen_types.TABBY: {
                    logprobs = parseTabbyLogprobs(data) || null;
                } break;
            } break;
        default:
            return;
    }

    saveLogprobsForActiveMessage(logprobs, continueFrom);
}

export function extractMessageFromData(data, activeApi = null) {
    function getResult() {
        if (typeof data === 'string') {
            return data;
        }

        switch (activeApi ?? main_api) {
            case 'kobold':
                return data.results[0].text;
            case 'koboldhorde':
                return data.text;
            case 'textgenerationwebui':
                return data.choices?.[0]?.text ?? data.choices?.[0]?.message?.content ?? data.content ?? data.response ?? data[0]?.content ?? '';
            case 'novel':
                return data.output;
            case 'openai':
                return data?.content?.filter(p => p.type === 'text')?.map(p => p.text)?.join('\n\n') ?? data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? data?.text ?? data?.message?.content?.[0]?.text ?? data?.message?.tool_plan ?? '';
            default:
                return '';
        }
    }

    const result = getResult();
    return Array.isArray(result) ? result.map(x => x.text).filter(x => x).join('') : result;
}

export function extractJsonFromData(data, { mainApi = null, chatCompletionSource = null, model = null, returnInvalidJson = false } = {}) {
    mainApi = mainApi ?? main_api;
    chatCompletionSource = chatCompletionSource ?? oai_settings.chat_completion_source;

    const tryParse = (/** @type {string} */ value) => {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.debug('Failed to parse content as JSON.', e);
        }
    };

    let result = {};

    switch (mainApi) {
        case 'openai': {
            const text = extractMessageFromData(data, mainApi);
            switch (chatCompletionSource) {
                case chat_completion_sources.CLAUDE:
                    result = data?.content?.find(x => x.type === 'tool_use')?.input;
                    break;
                case chat_completion_sources.PERPLEXITY:
                    result = tryParse(removeReasoningFromString(text));
                    if (!result && returnInvalidJson) {
                        return text;
                    }
                    break;
                case chat_completion_sources.VERTEXAI:
                    if (isVertexAiClaudeModelId((model ?? data?.model) || null)) {
                        result = tryParse(data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? '');
                        if (result) {
                            break;
                        }
                    }
                    // fall through
                case chat_completion_sources.MAKERSUITE:
                case chat_completion_sources.DEEPSEEK:
                case chat_completion_sources.AI21:
                case chat_completion_sources.GROQ:
                case chat_completion_sources.POLLINATIONS:
                case chat_completion_sources.AIMLAPI:
                case chat_completion_sources.OPENAI:
                case chat_completion_sources.OPENROUTER:
                case chat_completion_sources.MISTRALAI:
                case chat_completion_sources.CUSTOM:
                case chat_completion_sources.COHERE:
                case chat_completion_sources.XAI:
                case chat_completion_sources.ELECTRONHUB:
                case chat_completion_sources.CHUTES:
                case chat_completion_sources.AZURE_OPENAI:
                case chat_completion_sources.ZAI:
                default:
                    result = tryParse(text);
                    if (!result && returnInvalidJson) {
                        return text;
                    }
                    break;
            }
        } break;
    }

    return JSON.stringify(result ?? {});
}

function extractMultiSwipes(data, type) {
    const swipes = [];

    if (!data) {
        return swipes;
    }

    if (type === 'continue' || type === 'impersonate' || type === 'quiet') {
        return swipes;
    }

    if (main_api === 'textgenerationwebui' && textgen_settings.type === textgen_types.LLAMACPP) {
        if (!Array.isArray(data)) {
            return swipes;
        }

        const multiSwipeCount = data.length - 1;
        if (multiSwipeCount <= 0) {
            return swipes;
        }

        for (let i = 1; i < data.length; i++) {
            const text = data?.[i]?.content ?? '';
            swipes.push(text);
        }
    }

    if (main_api === 'openai' || (main_api === 'textgenerationwebui' && [textgen_types.MANCER, textgen_types.VLLM, textgen_types.APHRODITE, textgen_types.TABBY, textgen_types.INFERMATICAI].includes(textgen_settings.type))) {
        if (!Array.isArray(data.choices)) {
            return swipes;
        }

        const multiSwipeCount = data.choices.length - 1;

        if (multiSwipeCount <= 0) {
            return swipes;
        }

        for (let i = 1; i < data.choices.length; i++) {
            const text = data?.choices[i]?.message?.content ?? data?.choices[i]?.text ?? '';
            swipes.push(text);
        }
    }

    const cleanedSwipes = swipes.map(text => cleanUpMessage({
        getMessage: text,
        isImpersonate: false,
        isContinue: false,
        displayIncompleteSentences: false,
    }));

    return cleanedSwipes;
}

export function cleanUpMessage({ getMessage, isImpersonate, isContinue, displayIncompleteSentences = false, stoppingStrings = null, includeUserPromptBias = true, trimNames = true, trimWrongNames = true } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('cleanUpMessage called with positional arguments. Please use an object instead.');
        [getMessage, isImpersonate, isContinue, displayIncompleteSentences, stoppingStrings, includeUserPromptBias, trimNames, trimWrongNames] = arguments;
    }

    if (!getMessage) {
        return '';
    }

    // Add the prompt bias before anything else
    if (
        includeUserPromptBias &&
        power_user.user_prompt_bias &&
        !isImpersonate &&
        !isContinue &&
        power_user.user_prompt_bias.length !== 0
    ) {
        getMessage = substituteParams(power_user.user_prompt_bias) + getMessage;
    }

    // Allow for caching of stopping strings. getStoppingStrings is an expensive function, especially with macros
    // enabled, so for streaming, we call it once and then pass it into each cleanUpMessage call.
    if (!stoppingStrings) {
        stoppingStrings = getStoppingStrings(isImpersonate, isContinue, main_api);
    }

    for (const stoppingString of stoppingStrings) {
        if (stoppingString.length) {
            for (let j = stoppingString.length; j > 0; j--) {
                if (getMessage.slice(-j) === stoppingString.slice(0, j)) {
                    getMessage = getMessage.slice(0, -j);
                    break;
                }
            }
        }
    }

    // Regex uses vars, so add before formatting
    getMessage = getRegexedString(getMessage, isImpersonate ? regex_placement.USER_INPUT : regex_placement.AI_OUTPUT);

    if (power_user.collapse_newlines) {
        getMessage = collapseNewlines(getMessage);
    }

    // trailing invisible whitespace before every newlines, on a multiline string
    // "trailing whitespace on newlines       \nevery line of the string    \n?sample text" ->
    // "trailing whitespace on newlines\nevery line of the string\nsample text"
    getMessage = getMessage.replace(/[^\S\r\n]+$/gm, '');

    if (trimWrongNames) {
        // If this is an impersonation, delete the entire response if it starts with "{{char}}:"
        // If this isn't an impersonation, delete the entire response if it starts with "{{user}}:"
        // Also delete any trailing text that starts with the wrong name.
        // This only occurs if the corresponding "power_user.allow_nameX_display" is false.

        let wrongName = isImpersonate
            ? (!power_user.allow_name2_display ? name2 : '')  // char
            : (!power_user.allow_name1_display ? name1 : '');  // user

        if (wrongName) {
            // If the message starts with the wrong name, delete the entire response
            let startIndex = getMessage.indexOf(`${wrongName}:`);
            if (startIndex === 0) {
                getMessage = '';
                console.debug(`Message started with the wrong name: "${wrongName}" - response was deleted.`);
            }

            // If there is trailing text starting with the wrong name, trim it off.
            startIndex = getMessage.indexOf(`\n${wrongName}:`);
            if (startIndex >= 0) {
                getMessage = getMessage.substring(0, startIndex);
            }
        }
    }

    if (getMessage.indexOf('<|endoftext|>') != -1) {
        getMessage = getMessage.substring(0, getMessage.indexOf('<|endoftext|>'));
    }
    const isInstruct = power_user.instruct.enabled && main_api !== 'openai';
    const isNotEmpty = (str) => str && str.trim() !== '';
    if (isInstruct && power_user.instruct.stop_sequence) {
        if (getMessage.indexOf(power_user.instruct.stop_sequence) != -1) {
            getMessage = getMessage.substring(0, getMessage.indexOf(power_user.instruct.stop_sequence));
        }
    }
    // Hana: Only use the first sequence (should be <|model|>)
    // of the prompt before <|user|> (as KoboldAI Lite does it).
    if (isInstruct && isNotEmpty(power_user.instruct.input_sequence)) {
        if (getMessage.indexOf(power_user.instruct.input_sequence) != -1) {
            getMessage = getMessage.substring(0, getMessage.indexOf(power_user.instruct.input_sequence));
        }
    }

    // Remove instruct sequences leaking to the output
    if (isInstruct && power_user.instruct.sequences_as_stop_strings) {
        const sequences = [
            { value: power_user.instruct.input_sequence, apply: isImpersonate && isNotEmpty(power_user.instruct.input_sequence) },
            { value: power_user.instruct.output_sequence, apply: !isImpersonate && isNotEmpty(power_user.instruct.output_sequence) },
            { value: power_user.instruct.last_output_sequence, apply: !isImpersonate && isNotEmpty(power_user.instruct.last_output_sequence) },
        ];
        for (const seq of sequences.filter(s => s.apply)) {
            seq.value.split('\n').filter(line => line.trim() !== '').forEach(line => { getMessage = getMessage.replaceAll(line, ''); });
        }
    }

    // clean-up group message from excessive generations
    if (selected_group) {
        getMessage = cleanGroupMessage(getMessage);
    }

    if (!power_user.allow_name2_display) {
        const name2Escaped = escapeRegex(name2);
        getMessage = getMessage.replace(new RegExp(`(^|\n)${name2Escaped}:\\s*`, 'g'), '$1');
    }

    if (isImpersonate) {
        getMessage = getMessage.trim();
    }

    if (power_user.auto_fix_generated_markdown) {
        getMessage = fixMarkdown(getMessage, false);
    }

    if (trimNames) {
        // If this is an impersonation, trim "{{user}}:" from the beginning
        // If this isn't an impersonation, trim "{{char}}:" from the beginning.
        // Only applied when the corresponding "power_user.allow_nameX_display" is false.
        const nameToTrim2 = isImpersonate
            ? (!power_user.allow_name1_display ? name1 : '')  // user
            : (!power_user.allow_name2_display ? name2 : '');  // char

        if (nameToTrim2 && getMessage.startsWith(nameToTrim2 + ':')) {
            getMessage = getMessage.replace(nameToTrim2 + ':', '');
            getMessage = getMessage.trimStart();
        }
    }

    if (isImpersonate) {
        getMessage = getMessage.trim();
    }

    if (!displayIncompleteSentences && power_user.trim_sentences) {
        getMessage = trimToEndSentence(getMessage);
    }

    if (power_user.trim_spaces && !PromptReasoning.getLatestPrefix()) {
        getMessage = getMessage.trim();
    }

    return getMessage;
}

async function processImageAttachment(message, { imageUrls }) {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return;
    }

    for (const [index, imageUrl] of imageUrls.filter(onlyUnique).entries()) {
        if (!imageUrl) {
            continue;
        }

        let url = imageUrl;
        if (isDataURL(url)) {
            const fileName = `inline_image_${Date.now().toString()}_${index}`;
            const [mime, base64] = /^data:(.*?);base64,(.*)$/.exec(imageUrl).slice(1);
            url = await saveBase64AsFile(base64, message.name, fileName, mime.split('/')[1]);
        }
        saveImageToMessage({ image: url, inline: true }, message);
    }
}

export async function saveReply({ type, getMessage, fromStreaming = false, title = '', swipes = [], reasoning = '', imageUrls = [], reasoningSignature = null, native = null, providerReplay = null, promptCache = null, hasToolCalls = false }) {
    // Backward compatibility
    if (arguments.length > 1 && typeof arguments[0] !== 'object') {
        console.trace('saveReply called with positional arguments. Please use an object instead.');
        [type, getMessage, fromStreaming, title, swipes, reasoning, imageUrls, reasoningSignature, native] = arguments;
    }

    const lastMessage = chat[chat.length - 1];
    if (lastMessage?.role === 'tool' && ['append', 'continue', 'appendFinal', 'swipe'].includes(type)) {
        type = 'normal';
    }

    if (type != 'append' && type != 'continue' && type != 'appendFinal' && chat.length && (lastMessage.swipe_id === undefined ||
        lastMessage.is_user)) {
        type = 'normal';
    }

    if (chat.length && (!lastMessage.extra || typeof lastMessage.extra !== 'object')) {
        lastMessage.extra = {};
    }

    // Coerce null/undefined to empty string
    if (chat.length && !lastMessage.extra.reasoning) {
        lastMessage.extra.reasoning = '';
    }

    if (!reasoning) {
        reasoning = '';
    }

    const replayMetadata = native || reasoningSignature || hasToolCalls ? providerReplay : undefined;

    let oldMessage = '';
    const generationFinished = new Date();
    if (type === 'swipe') {
        oldMessage = lastMessage.mes;
        lastMessage.swipes.length++;
        if (lastMessage.swipe_id === lastMessage.swipes.length - 1) {
            lastMessage.title = title;
            lastMessage.mes = getMessage;
            lastMessage.gen_started = generation_started;
            lastMessage.gen_finished = generationFinished;
            lastMessage.send_date = getMessageTimeStamp();
            lastMessage.extra.api = providerReplay?.chatCompletionSource ?? getGeneratingApi();
            lastMessage.extra.model = providerReplay?.model ?? getGeneratingModel();
            lastMessage.extra.reasoning = reasoning;
            lastMessage.extra.reasoning_duration = null;
            lastMessage.extra.reasoning_signature = reasoningSignature;
            lastMessage.extra.prompt_cache = promptCache ?? undefined;
            delete lastMessage.extra.time_to_first_token;
            lastMessage.extra.native = native ?? undefined;
            lastMessage.extra.provider_replay = replayMetadata;
            await processImageAttachment(lastMessage, { imageUrls });
            if (shouldCountMessageTokens()) {
                const tokenCountText = (reasoning || '') + lastMessage.mes;
                lastMessage.extra.token_count = await getTokenCountAsync(tokenCountText, 0);
            }
            const chat_id = (chat.length - 1);
            const emitMessageEvents = !fromStreaming && shouldEmitCharacterMessageEvents(chat[chat_id], hasToolCalls);
            emitMessageEvents && await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
            addOneMessage(chat[chat_id], { type: 'swipe', transient: fromStreaming });
            if (!fromStreaming) await finalizeMessageContent(chat_id, emitMessageEvents ? event_types.CHARACTER_MESSAGE_RENDERED : null, type);
        } else {
            lastMessage.mes = getMessage;
        }
    } else if (type === 'append' || type === 'continue') {
        console.debug('Trying to append.');
        oldMessage = lastMessage.mes;
        lastMessage.title = title;
        lastMessage.mes += getMessage;
        lastMessage.gen_started = generation_started;
        lastMessage.gen_finished = generationFinished;
        lastMessage.send_date = getMessageTimeStamp();
        lastMessage.extra.api = providerReplay?.chatCompletionSource ?? getGeneratingApi();
        lastMessage.extra.model = providerReplay?.model ?? getGeneratingModel();
        lastMessage.extra.reasoning = reasoning;
        lastMessage.extra.reasoning_duration = null;
        lastMessage.extra.reasoning_signature = reasoningSignature;
        lastMessage.extra.prompt_cache = promptCache ?? undefined;
        delete lastMessage.extra.time_to_first_token;
        lastMessage.extra.native = native ?? undefined;
        lastMessage.extra.provider_replay = replayMetadata;
        await processImageAttachment(lastMessage, { imageUrls });
        if (shouldCountMessageTokens()) {
            const tokenCountText = (reasoning || '') + lastMessage.mes;
            lastMessage.extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }
        const chat_id = (chat.length - 1);
        const emitMessageEvents = !fromStreaming && shouldEmitCharacterMessageEvents(chat[chat_id], hasToolCalls);
        emitMessageEvents && await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
        addOneMessage(chat[chat_id], { type: 'swipe', transient: fromStreaming });
        if (!fromStreaming) await finalizeMessageContent(chat_id, emitMessageEvents ? event_types.CHARACTER_MESSAGE_RENDERED : null, type);
    } else if (type === 'appendFinal') {
        oldMessage = lastMessage.mes;
        console.debug('Trying to appendFinal.');
        lastMessage.title = title;
        lastMessage.mes = getMessage;
        lastMessage.gen_started = generation_started;
        lastMessage.gen_finished = generationFinished;
        lastMessage.send_date = getMessageTimeStamp();
        lastMessage.extra.api = providerReplay?.chatCompletionSource ?? getGeneratingApi();
        lastMessage.extra.model = providerReplay?.model ?? getGeneratingModel();
        lastMessage.extra.reasoning += reasoning;
        lastMessage.extra.reasoning_signature = reasoningSignature;
        lastMessage.extra.prompt_cache = promptCache ?? undefined;
        delete lastMessage.extra.time_to_first_token;
        lastMessage.extra.native = native ?? undefined;
        lastMessage.extra.provider_replay = replayMetadata;
        await processImageAttachment(lastMessage, { imageUrls });
        // We don't know if the reasoning duration extended, so we don't update it here on purpose.
        if (shouldCountMessageTokens()) {
            const tokenCountText = (reasoning || '') + lastMessage.mes;
            lastMessage.extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }
        const chat_id = (chat.length - 1);
        const emitMessageEvents = !fromStreaming && shouldEmitCharacterMessageEvents(chat[chat_id], hasToolCalls);
        emitMessageEvents && await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
        addOneMessage(chat[chat_id], { type: 'swipe', transient: fromStreaming });
        if (!fromStreaming) await finalizeMessageContent(chat_id, emitMessageEvents ? event_types.CHARACTER_MESSAGE_RENDERED : null, type);
    } else {
        console.debug('entering chat update routine for non-swipe post');
        if (power_user.trim_spaces) {
            getMessage = getMessage.trim();
        }
        const newMessage = {
            name: name2,
            is_user: false,
            send_date: getMessageTimeStamp(),
            mes: getMessage,
            title,
            gen_started: generation_started,
            gen_finished: generationFinished,
            extra: {
                api: providerReplay?.chatCompletionSource ?? getGeneratingApi(),
                model: providerReplay?.model ?? getGeneratingModel(),
                reasoning,
                reasoning_duration: null,
                reasoning_signature: reasoningSignature,
                ...(promptCache ? { prompt_cache: promptCache } : {}),
                ...(native !== null && native !== undefined ? { native } : {}),
                ...(replayMetadata ? { provider_replay: replayMetadata } : {}),
            },
        };

        if (shouldCountMessageTokens()) {
            const tokenCountText = (reasoning || '') + newMessage.mes;
            newMessage.extra.token_count = await getTokenCountAsync(tokenCountText, 0);
        }

        if (selected_group) {
            console.debug('entering chat update for groups');
            let avatarImg = 'img/ai4.png';
            if (characters[this_chid].avatar != 'none') {
                avatarImg = getThumbnailUrl('avatar', characters[this_chid].avatar);
            }
            newMessage.force_avatar = avatarImg;
            newMessage.original_avatar = characters[this_chid].avatar;
            newMessage.extra.gen_id = group_generation_id;
        }

        await processImageAttachment(newMessage, { imageUrls });
        const chat_id = chat.length;
        const emitMessageEvents = !fromStreaming && shouldEmitCharacterMessageEvents(newMessage, hasToolCalls);
        await withChatSurfaceStructureMutation(async () => {
            chat.push(newMessage);
            emitMessageEvents && await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
            addOneMessage(chat[chat_id], { transient: fromStreaming });
        });
        if (!fromStreaming) await finalizeMessageContent(chat_id, emitMessageEvents ? event_types.CHARACTER_MESSAGE_RENDERED : null, type);
    }

    const item = chat[chat.length - 1];
    if (item.swipe_info === undefined) {
        item.swipe_info = [];
    }
    if (item.swipe_id !== undefined) {
        const swipeId = item.swipe_id;
        item.swipes[swipeId] = item.mes;
        item.swipe_info[swipeId] = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: structuredClone(item.extra),
        };
    } else {
        item.swipe_id = 0;
        item.swipes = [];
        item.swipes[0] = item.mes;
        item.swipe_info[0] = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: structuredClone(item.extra),
        };
    }

    if (Array.isArray(swipes) && swipes.length > 0) {
        const swipeInfoExtra = structuredClone(item.extra ?? {});
        delete swipeInfoExtra.token_count;
        delete swipeInfoExtra.reasoning;
        delete swipeInfoExtra.reasoning_duration;
        const swipeInfo = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: swipeInfoExtra,
        };
        const swipeInfoArray = Array(swipes.length).fill().map(() => structuredClone(swipeInfo));
        parseReasoningInSwipes(swipes, swipeInfoArray, item.extra?.reasoning_duration);
        item.swipes.push(...swipes);
        item.swipe_info.push(...swipeInfoArray);
    }

    statMesProcess(item, type, characters, this_chid, oldMessage);
    return { type, getMessage };
}

export function ensureSwipes(message) {
    let updated = false;
    if (message?.tt_swipe_cold) return updated;

    if (!message || typeof message !== 'object') {
        console.trace(`[ensureSwipes] failed. '${message}' is not an object.`);
        return updated;
    }

    //Small system messages, Tool turns, and user messages should not have swipes.
    if (message?.is_user || message?.role === 'tool' || Array.isArray(message?.tool_calls) || message?.extra?.isSmallSys) {
        return updated;
    }

    if (!Array.isArray(message.swipes)) {
        message.swipes = [message.mes ?? ''];
        updated = true;
    }

    if (typeof message.swipe_id !== 'number') {
        message.swipe_id = 0;
        updated = true;
    }

    /** @type {() => SwipeInfo} */
    const createSwipeInfo = () => ({
        send_date: message.send_date,
        gen_started: message.gen_started,
        gen_finished: message.gen_finished,
        extra: {},
    });

    if (!Array.isArray(message.swipe_info)) {
        message.swipe_info = message.swipes.map(_ => createSwipeInfo());
        updated = true;
    }

    for (let i = 0; i < message.swipes.length; i++) {
        if (typeof message.swipes[i] !== 'string') {
            updated = true;
            console.warn('The message had a swipe that is not a string. It has has been set to \'\'.', message);
            message.swipes[i] = '';
        }
        if (!message.swipe_info[i] || typeof message.swipe_info[i] !== 'object') {
            updated = true;
            console.warn('The message had missing or invalid swipe_info for a swipe. It has been backfilled.', message);
            message.swipe_info[i] = createSwipeInfo();
        }
    }

    return updated;
}

export function syncMesToSwipe(messageId = null) {
    if (!chat.length) {
        return false;
    }

    const targetMessageId = messageId ?? chat.length - 1;
    if (targetMessageId >= chat.length || targetMessageId < 0) {
        console.warn(`[syncMesToSwipe] Invalid message ID: ${messageId}`);
        return false;
    }

    const targetMessage = chat[targetMessageId];
    if (!targetMessage) {
        return false;
    }

    // No swipe data there yet, exit out
    if (typeof targetMessage.swipe_id !== 'number') {
        return false;
    }
    // If swipes structure is invalid, exit out (for now?)
    if (!Array.isArray(targetMessage.swipe_info) || !Array.isArray(targetMessage.swipes)) {
        return false;
    }
    // If the swipe is not present yet, exit out (will likely be copied later)
    // "" is falsy. An empty string is a valid message.
    if (typeof targetMessage.swipes[targetMessage.swipe_id] !== 'string' || !targetMessage.swipe_info[targetMessage.swipe_id]) {
        return false;
    }

    const targetSwipeInfo = targetMessage.swipe_info[targetMessage.swipe_id];
    if (typeof targetSwipeInfo !== 'object') {
        return false;
    }

    // Only sync swipes if the chat is not pristine, so that macros in the greeting can resolve again on swipe
    if (chat_metadata.tainted || chat.length > 1) {
        targetMessage.swipes[targetMessage.swipe_id] = targetMessage.mes;
    }

    targetSwipeInfo.send_date = targetMessage.send_date;
    targetSwipeInfo.gen_started = targetMessage.gen_started;
    targetSwipeInfo.gen_finished = targetMessage.gen_finished;
    targetSwipeInfo.extra = structuredClone(targetMessage.extra);

    return true;
}

export function syncSwipeToMes(messageId = null, swipeId = null, targetMessage = null) {
    if (!targetMessage && !chat.length) {
        return false;
    }

    if (!targetMessage) {
        const targetMessageId = messageId ?? chat.length - 1;
        if (targetMessageId >= chat.length || targetMessageId < 0) {
            console.warn(`[syncSwipeToMes] Invalid message ID: ${messageId}`);
            return false;
        }

        targetMessage = chat[targetMessageId];
    }

    if (!targetMessage) {
        return false;
    }

    if (swipeId !== null) {
        if (isNaN(swipeId) || swipeId < 0) {
            console.warn(`[syncSwipeToMes] Invalid swipe ID: ${swipeId}`);
            return false;
        }
        targetMessage.swipe_id = swipeId;
    }

    // No swipe data there yet, exit out
    if (typeof targetMessage.swipe_id !== 'number') {
        return false;
    }
    // If swipes structure is invalid, exit out
    if (!Array.isArray(targetMessage.swipes)) {
        return false;
    }

    // Backfill swipe_info if missing.
    if (!Array.isArray(targetMessage.swipe_info)) {
        targetMessage.swipe_info = targetMessage.swipes.map(_ => ({
            send_date: targetMessage.send_date,
            gen_started: void 0,
            gen_finished: void 0,
            extra: {},
        }));
    }

    const targetSwipeId = targetMessage.swipe_id;
    if (typeof targetMessage.swipes[targetSwipeId] !== 'string') {
        console.warn(`[syncSwipeToMes] Invalid swipe ID: ${targetSwipeId}`);
        return false;
    }

    const targetSwipeInfo = targetMessage?.swipe_info?.[targetSwipeId];
    if (typeof targetSwipeInfo !== 'object') {
        console.warn(`[syncSwipeToMes] Invalid swipe info: ${targetSwipeId}`);
    }

    targetMessage.mes = targetMessage.swipes[targetSwipeId];
    targetMessage.send_date = targetSwipeInfo?.send_date;
    targetMessage.gen_started = targetSwipeInfo?.gen_started;
    targetMessage.gen_finished = targetSwipeInfo?.gen_finished;
    targetMessage.extra = structuredClone(targetSwipeInfo?.extra) ?? {};

    return true;
}

function saveImageToMessage(img, mes) {
    if (mes && img.image) {
        if (!mes.extra || typeof mes.extra !== 'object') {
            mes.extra = {};
        }
        if (!Array.isArray(mes.extra.media)) {
            mes.extra.media = [];
        }
        mes.extra.media.push({ url: img.image, type: MEDIA_TYPE.IMAGE, title: img.title, source: MEDIA_SOURCE.API });
        mes.extra.inline_image = img.inline;
    }
}

export function getGeneratingApi() {
    switch (main_api) {
        case 'openai':
            return oai_settings.chat_completion_source || 'openai';
        case 'textgenerationwebui':
            return textgen_settings.type === textgen_types.OOBA ? 'textgenerationwebui' : textgen_settings.type;
        default:
            return main_api;
    }
}

export function getGeneratingModel(mes) {
    let model = '';
    switch (main_api) {
        case 'kobold':
            model = online_status;
            break;
        case 'novel':
            model = nai_settings.model_novel;
            break;
        case 'openai':
            model = getChatCompletionModel();
            break;
        case 'textgenerationwebui':
            model = online_status;
            break;
        case 'koboldhorde':
            model = kobold_horde_model;
            break;
    }
    return model;
}

export function activateSendButtons() {
    is_send_press = false;
    hideStopButton();
    showSwipeButtons();
    delete document.body.dataset.generating;
    delete document.body.dataset.agentGuidanceReady;
    syncChatInputState();
}

export function deactivateSendButtons() {
    showStopButton();
    hideSwipeButtons();
    document.body.dataset.generating = 'true';
    syncChatInputState();
}

export function resetChatState() {
    // replaces deleted charcter name with system user since it will be displayed next.
    name2 = (this_chid === undefined && neutralCharacterName) ? neutralCharacterName : systemUserName;
    //unsets expected chid before reloading (related to getCharacters/printCharacters from using old arrays)
    setCharacterId(undefined);
    // sets up system user to tell user about having deleted a character
    replaceChatContents(SAFETY_CHAT);
    // resets chat metadata
    chat_metadata = {};
    // resets the characters array, forcing getcharacters to reset
    characters.length = 0;
}

export function setMenuType(value) {
    menu_type = value;
    // Allow custom CSS to see which menu type is active
    document.getElementById('right-nav-panel').dataset.menuType = menu_type;
}

export function setExternalAbortController(controller) {
    abortController = controller;
}

export function setCharacterId(value) {
    switch (typeof value) {
        case 'bigint':
        case 'number':
            this_chid = String(value);
            break;
        case 'string':
            this_chid = !isNaN(parseInt(value)) ? value : undefined;
            break;
        case 'object':
            this_chid = characters.indexOf(value) !== -1 ? String(characters.indexOf(value)) : undefined;
            break;
        case 'undefined':
            this_chid = undefined;
            break;
        default:
            console.error('Invalid character ID type:', value);
            break;
    }
}

export function setCharacterName(value) {
    name2 = value;
}

export function setOnlineStatus(value) {
    const previousStatus = online_status;
    online_status = value;
    displayOnlineStatus();
    if (previousStatus !== online_status) {
        eventSource.emitAndWait(event_types.ONLINE_STATUS_CHANGED, online_status);
    }
}

export function setEditedMessageId(value) {
    this_edit_mes_id = value;
    syncChatSurfaceProjectionHold();
}

export function setSendButtonState(value) {
    is_send_press = value;
}

export async function renameCharacter(name = null, { silent = false, renameChats = null } = {}) {
    if (!name && silent) {
        toastr.warning(t`No character name provided.`, t`Rename Character`);
        return false;
    }
    if (this_chid === undefined) {
        toastr.warning(t`No character selected.`, t`Rename Character`);
        return false;
    }

    const oldAvatar = characters[this_chid].avatar;
    const newValue = name || await Popup.show.input(t`Rename Character`, '', characters[this_chid].name, { inputLabel: t`New name:` });

    if (!newValue) {
        toastr.warning(t`No character name provided.`, t`Rename Character`);
        return false;
    }
    if (newValue === characters[this_chid].name) {
        toastr.info(t`Same character name provided, so name did not change.`, t`Rename Character`);
        return false;
    }

    const body = JSON.stringify({ avatar_url: oldAvatar, new_name: newValue });
    const response = await fetch('/api/characters/rename', {
        method: 'POST',
        headers: getRequestHeaders(),
        body,
    });

    try {
        if (response.ok) {
            const data = await response.json();
            const newAvatar = data.avatar;

            const oldName = getCharaFilename(null, { manualAvatarKey: oldAvatar });
            const newName = getCharaFilename(null, { manualAvatarKey: newAvatar });

            // Replace other auxiliary fields where was referenced by avatar key
            // Tag List
            renameTagKey(oldAvatar, newAvatar);

            // Additional lore books
            const charLore = world_info.charLore?.find(x => x.name == oldName);
            if (charLore) {
                charLore.name = newName;
                saveSettingsDebounced();
            }

            // Char-bound Author's Notes
            const charNote = extension_settings.note.chara?.find(x => x.name == oldName);
            if (charNote) {
                charNote.name = newName;
                saveSettingsDebounced();
            }

            // Update active character, if the current one was the currently active one
            if (active_character === oldAvatar) {
                active_character = newAvatar;
                saveSettingsDebounced();
            }

            await eventSource.emit(event_types.CHARACTER_RENAMED, oldAvatar, newAvatar);

            // Unload current character
            setCharacterId(undefined);
            // Reload characters list
            await getCharacters();

            // Find newly renamed character
            const newChId = characters.findIndex(c => c.avatar == data.avatar);

            if (newChId !== -1) {
                // Select the character after the renaming
                await selectCharacterById(newChId);

                // Async delay to update UI
                await delay(1);

                if (this_chid === undefined) {
                    throw new Error('New character not selected');
                }

                // Also rename as a group member
                await renameGroupMember(oldAvatar, newAvatar, newValue.toString());
                const renamePastChatsConfirm = renameChats !== null
                    ? renameChats
                    : silent
                        ? false
                        : await Popup.show.confirm(
                            t`Character renamed!`,
                            `<p>${t`Past chats will still contain the old character name. Would you like to update the character name in previous chats as well?`}</p>
                            <i><b>${t`Sprites folder (if any) should be renamed manually.`}</b></i>`,
                        ) == POPUP_RESULT.AFFIRMATIVE;

                if (renamePastChatsConfirm) {
                    await renamePastChats(oldAvatar, newAvatar, newValue);
                    await reloadCurrentChat();
                    toastr.success(t`Character renamed and past chats updated!`, t`Rename Character`);
                } else {
                    toastr.success(t`Character renamed!`, t`Rename Character`);
                }
            } else {
                throw new Error('Newly renamed character was lost?');
            }
        } else {
            throw new Error('Could not rename the character');
        }
    } catch (error) {
        // Reloading to prevent data corruption
        if (!silent) await Popup.show.text(t`Rename Character`, t`Something went wrong. The page will be reloaded.`);
        else toastr.error(t`Something went wrong. The page will be reloaded.`, t`Rename Character`);

        console.log('Renaming character error:', error);
        location.reload();
        return false;
    }

    return true;
}

async function renamePastChats(oldAvatar, newAvatar, newName) {
    const pastChats = await getPastCharacterChats();

    for (const { file_name } of pastChats) {
        try {
            const fileNameWithoutExtension = file_name.replace('.jsonl', '');
            const currentChat = await loadCharacterChatPayload({
                characterName: newName,
                avatarUrl: newAvatar,
                fileName: fileNameWithoutExtension,
            });

            if (currentChat.length) {
                for (const message of currentChat) {
                    if (message.is_user || message.is_system || message.extra?.type == system_message_types.NARRATOR) {
                        continue;
                    }

                    if (message.name !== undefined) {
                        message.name = newName;
                    }
                }

                await eventSource.emit(event_types.CHARACTER_RENAMED_IN_PAST_CHAT, currentChat, oldAvatar, newAvatar);

                await saveCharacterChatPayload({
                    characterName: newName,
                    avatarUrl: newAvatar,
                    fileName: fileNameWithoutExtension,
                    payload: currentChat,
                });
            }
        } catch (error) {
            toastr.error(t`Past chat could not be updated: ${file_name}`);
            console.error(error);
        }
    }
}

export function saveChatDebounced() {
    const chid = this_chid;
    const selectedGroup = selected_group;

    cancelDebouncedChatSave();

    pendingChatSaveTask = async () => {
        if (selectedGroup !== selected_group) {
            console.warn('Chat save timeout triggered, but group changed. Aborting.');
            return;
        }

        if (chid !== this_chid) {
            console.warn('Chat save timeout triggered, but chid changed. Aborting.');
            return;
        }

        console.debug('Chat save timeout triggered');
        await saveChatConditional();
        console.debug('Chat saved');
    };

    chatSaveTimeout = setTimeout(async () => {
        const task = pendingChatSaveTask;
        chatSaveTimeout = null;
        pendingChatSaveTask = null;
        await task?.();
    }, DEFAULT_SAVE_EDIT_TIMEOUT);
}

export function flushDebouncedChatSave() {
    if (!chatSaveTimeout || !pendingChatSaveTask) {
        return null;
    }

    const task = pendingChatSaveTask;
    clearTimeout(chatSaveTimeout);
    chatSaveTimeout = null;
    pendingChatSaveTask = null;
    return task();
}

const pendingSaves = new Set();

const SAVE_SCOPE_RANK = Object.freeze({ metadata: 1, payload: 2 });

const BARRIER_COMMIT_REASONS = new Set([CHAT_COMMIT_REASON.PROVIDER_BARRIER, CHAT_COMMIT_REASON.GENERATION_CHECKPOINT]);

function enqueueMergeableSave({ scope, barrier = false, force = false, task }) {
    const entry = { scope, barrier, force, started: false, absorbedBy: null, followers: new Set() };
    const completion = new Promise((resolve, reject) => { entry.resolve = resolve; entry.reject = reject; });

    async function runTask() {
        if (entry.absorbedBy) return;
        entry.started = true;
        try {
            const value = await task();
            entry.resolve(value);
            for (const follower of entry.followers) follower.resolve(value);
            return value;
        } catch (error) {
            // Taken over by a newer save: it settles this promise as a follower, whatever
            // this task was doing when the takeover happened.
            if (entry.absorbedBy) return;
            entry.reject(error);
            for (const follower of entry.followers) follower.reject(error);
            throw error;
        } finally {
            pendingSaves.delete(entry);
        }
    }

    const run = enqueueChatSave(runTask);
    run.catch(() => {}); // completion carries the outcome to callers

    let absorbed = 0;
    let cancelled = 0;
    for (const previous of pendingSaves) {
        if (previous.absorbedBy || previous.barrier) continue;
        if (SAVE_SCOPE_RANK[scope] < SAVE_SCOPE_RANK[previous.scope]) continue;
        if (previous.force && !force) continue;
        previous.absorbedBy = entry;
        pendingSaves.delete(previous);
        if (previous.started) {
            cancelled += 1;
            requestChatCommitCancellation();
        }
        for (const follower of previous.followers) {
            follower.absorbedBy = entry;
            entry.followers.add(follower);
        }
        previous.followers.clear();
        entry.followers.add(previous);
        absorbed += 1;
    }
    if (absorbed > 0) {
        console.info(`[SAVE-MERGE] ${scope} absorbed ${absorbed} pending save(s)` + (cancelled > 0 ? `, cancelled ${cancelled} in-flight` : ''));
    }
    pendingSaves.add(entry);
    return completion;
}

export async function saveChat(...args) {
    if (selected_group) {
        toastr.error(t`Operation was aborted to prevent data corruption.`, t`saveChat called for a group chat`);
        throw new Error('saveChat called for a group chat');
    }

    const options = (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) ? args[0] : null;
    // Positional saves may target a caller-supplied file; only the supported option form
    // (or a bare current-chat save) is safe to merge with later current-chat writes.
    const explicit = options && (options.chatData !== undefined || options.chatName !== undefined
        || options.mesId !== undefined || options.withMetadata !== undefined);
    if (explicit || (args.length > 0 && !options)) {
        return enqueueChatSave(() => saveChatUnsafe(...args));
    }

    return enqueueMergeableSave({
        scope: 'payload',
        barrier: BARRIER_COMMIT_REASONS.has(options?.commitReason),
        force: options?.force === true,
        task: () => saveChatUnsafe(...args),
    });
}

async function confirmChatIntegrityOverwrite() {
    const popupResult = await Popup.show.input(
        t`ERROR: Chat integrity check failed while saving the file.`,
        t`<p>After you click OK, the page will be reloaded to prevent data corruption.</p>
              <p>To confirm an overwrite (and potentially <b>LOSE YOUR DATA</b>), enter <code>OVERWRITE</code> (in all caps) in the box below before clicking OK.</p>`,
        '',
        { okButton: 'OK', cancelButton: false },
    );

    if (popupResult === 'OVERWRITE') {
        return true;
    }

    console.warn('Chat integrity check failed, and user did not confirm the overwrite. Reloading the page.');
    window.location.reload();
    return false;
}

export async function runChatSave({ save, recover, title }) {
    try {
        await save();
    } catch (error) {
        if (error?.code === 'commit_superseded') {
            // A newer save took this write over; it settles the caller, so this is not a failure.
            throw error;
        }
        if (error?.code !== 'integrity' || !recover) {
            console.error(error);
            toastr.error(t`Check the server connection and reload the page to prevent data loss.`, title);
            throw error;
        }
        if (await confirmChatIntegrityOverwrite()) {
            await recover();
        }
    }
}

export function persistedChatMetadata(overrides) {
    const metadata = { ...chat_metadata, ...overrides };
    delete metadata.lastInContextMessageId;
    return metadata;
}

async function saveChatUnsafe({ chatName, withMetadata, mesId, force = false, chatData = undefined, commitReason = CHAT_COMMIT_REASON.MUTATION } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('saveChat called with positional arguments. Please use an object instead.');
        [chatName, withMetadata, mesId, force] = arguments;
    }

    const fileName = chatName ?? characters[this_chid]?.chat;

    if (!fileName && name2 === neutralCharacterName) {
        // TODO: Do something for a temporary chat with no character.
        return;
    }

    if (!fileName) {
        console.warn('saveChat called without chat_name and no chat file found');
        return;
    }

    characters[this_chid].date_last_chat = Date.now();

    const trimmedChat = Array.isArray(chatData)
        ? chatData
        : (mesId !== undefined && mesId >= 0 && mesId < chat.length)
            ? chat.slice(0, Number(mesId) + 1)
            : chat.slice();

    /** @type {ChatHeader} */
    const chatHeader = {
        chat_metadata: persistedChatMetadata(withMetadata),
        user_name: 'unused',
        character_name: 'unused',
    };
    const payload = [chatHeader, ...trimmedChat];

    await runChatSave({
        title: t`Chat could not be saved`,
        save: () => saveCharacterChatPayload({
            characterName: characters[this_chid].name,
            avatarUrl: characters[this_chid].avatar,
            fileName,
            payload,
            force,
            commitReason,
        }),
        // A forced save skips the integrity check, so nothing is left to recover.
        recover: force ? undefined : () => saveChatUnsafe({ chatName, withMetadata, mesId, force: true, chatData, commitReason }),
    });
}

async function read_avatar_load(input) {
    if (input.files && input.files[0]) {
        if (selected_button == 'create') {
            create_save.avatar = input.files;
        }

        crop_data = undefined;
        const file = input.files[0];
        const fileData = await getBase64Async(file);

        if (!power_user.never_resize_avatars) {
            const dlg = new Popup('Set the crop position of the avatar image', POPUP_TYPE.CROP, '', { label: t`Set the crop position of the avatar image`, cropImage: fileData });
            const croppedImage = await dlg.show();

            if (!croppedImage) {
                return;
            }

            crop_data = dlg.cropData;
            $('#avatar_load_preview').attr('src', String(croppedImage));
        } else {
            $('#avatar_load_preview').attr('src', fileData);
        }

        if (menu_type == 'create') {
            return;
        }

        await createOrEditCharacter();

        const formData = new FormData(/** @type {HTMLFormElement} */($('#form_create').get(0)));
        const avatarKey = formData.get('avatar_url').toString();

        await refreshCharacterAvatarImages(avatarKey);
        console.log('Avatar refreshed');
    }
}

export function getThumbnailUrl(type, file, t = false) {
    return buildThumbnailUrl(type, file, { useTimestamp: t });
}

export async function refreshCharacterAvatarImages(avatarKey) {
    const urls = new Set([
        getThumbnailUrl('avatar', avatarKey),
        getListThumbnailUrl('avatar', avatarKey),
        `/characters/${encodeURIComponent(avatarKey)}`,
    ].map(url => new URL(url, window.location.href).href));
    const images = Array.from(document.images)
        .filter(image => urls.has(image.src))
        .map(image => ({ image, src: image.src }));

    if (images.length === 0) {
        return;
    }

    await Promise.all([...new Set(images.map(({ src }) => src))].map(async (src) => {
        const response = await fetch(src, { cache: 'reload' });
        if (!response.ok) {
            throw new Error(`Failed to reload character avatar: HTTP ${response.status}`);
        }
    }));

    images.forEach(({ image }) => image.removeAttribute('src'));
    await new Promise(resolve => requestAnimationFrame(resolve));
    images.forEach(({ image, src }) => { image.src = src; });
}

export function buildAvatarList(block, entities, { templateId = 'inline_avatar_template', empty = true, interactable = false, highlightFavs = true } = {}) {
    if (empty) {
        block.empty();
    }

    for (const entity of entities) {
        const id = entity.id;

        // Populate the template
        const avatarTemplate = $(`#${templateId} .avatar`).clone();

        let this_avatar = default_avatar;
        if (entity.item.avatar !== undefined && entity.item.avatar != 'none') {
            this_avatar = getListThumbnailUrl('avatar', entity.item.avatar);
        }

        avatarTemplate.attr('data-type', entity.type);
        avatarTemplate.attr('data-chid', id);
        avatarTemplate.find('img').attr('src', this_avatar).attr('alt', entity.item.name);
        avatarTemplate.attr('title', `[Character] ${entity.item.name}\nFile: ${entity.item.avatar}`);
        if (highlightFavs) {
            avatarTemplate.toggleClass('is_fav', entity.item.fav || entity.item.fav == 'true');
            avatarTemplate.find('.ch_fav').val(entity.item.fav);
        }

        // If this is a group, we need to hack slightly. We still want to keep most of the css classes and layout, but use a group avatar instead.
        if (entity.type === 'group') {
            const grpTemplate = getGroupAvatar(entity.item);

            avatarTemplate.addClass(grpTemplate.attr('class'));
            avatarTemplate.empty();
            avatarTemplate.append(grpTemplate.children());
            avatarTemplate.attr({ 'data-grid': id, 'data-chid': null });
            avatarTemplate.attr('title', `[Group] ${entity.item.name}`);
        } else if (entity.type === 'persona') {
            avatarTemplate.attr({ 'data-pid': id, 'data-chid': null });
            avatarTemplate.find('img').attr('src', getListThumbnailUrl('persona', entity.item.avatar));
            avatarTemplate.attr('title', `[Persona] ${entity.item.name}\nFile: ${entity.item.avatar}`);
        }

        if (interactable) {
            avatarTemplate.addClass(`${INTERACTABLE_CONTROL_CLASS} ${CONTROL_SHELL_CLASS}`);
            const primary = document.createElement('button');
            primary.type = 'button';
            primary.className = 'sr-only';
            primary.setAttribute('aria-label', entity.item.name);
            avatarTemplate.prepend(primary);
            avatarTemplate.find('img').attr('alt', '');
            avatarTemplate.toggleClass('character_select', entity.type === 'character');
            avatarTemplate.toggleClass('group_select', entity.type === 'group');
        }

        block.append(avatarTemplate);
    }
}

export async function unshallowCharacter(characterId) {
    if (characterId === undefined) {
        console.debug('Undefined character cannot be unshallowed');
        return;
    }

    /** @type {Character} */
    const character = characters[characterId];
    if (!character) {
        console.debug('Character not found:', characterId);
        return;
    }

    // Character is not shallow
    if (!character.shallow) {
        return;
    }

    const avatar = character.avatar;
    if (!avatar) {
        console.debug('Character has no avatar field:', characterId);
        return;
    }

    await getOneCharacter(avatar);
}

export async function getChat({ allowNewChat = false } = {}) {
    const startedChid = this_chid;
    const startedSelectedGroup = selected_group;
    const isStillSelected = () => startedSelectedGroup === selected_group && startedChid === this_chid;
    let startedCharacter;
    let startedChatFile;
    let data;

    try {
        await unshallowCharacter(startedChid);
        if (!isStillSelected()) {
            return;
        }

        startedCharacter = startedChid !== undefined ? characters[startedChid] : null;
        startedChatFile = startedCharacter?.chat;
        data = await loadCharacterChatPayload({
            coldSwipes: coldSwipesEnabled(),
            characterName: startedCharacter?.name,
            avatarUrl: startedCharacter?.avatar,
            fileName: startedChatFile,
            allowNotFound: allowNewChat,
        });

        const currentCharacter = startedChid !== undefined ? characters[startedChid] : null;
        const stillActive = isStillSelected() && currentCharacter?.chat === startedChatFile;
        if (!stillActive) {
            return;
        }

        /** @type {ChatHeader} */
        const chatHeader = data.shift();
        chat_metadata = chatHeader?.chat_metadata ?? {};
        replaceChatContents(data);
        chat.forEach(ensureMessageMediaIsArray);

        if (!chat_metadata.integrity) {
            chat_metadata.integrity = uuidv4();
        }
        await getChatResult({ allowNewChat });
        eventSource.emit(event_types.CHAT_LOADED, { detail: { id: this_chid, character: characters[this_chid] } });

    } catch (error) {
        const currentCharacter = startedChid !== undefined ? characters[startedChid] : null;
        const stillActive = isStillSelected()
            && (startedCharacter === undefined || currentCharacter?.chat === startedChatFile);
        if (!stillActive) {
            return;
        }

        console.error(error);
        toastr.error(t`Chat could not be loaded.`, t`Chat Load Failed`);
        throw error;
    } finally {
        discardColdChatPayload(data);
    }
}

async function getChatResult({ allowNewChat = false } = {}) {
    name2 = characters[this_chid].name;
    let freshChat = false;
    if (allowNewChat && chat.length === 0) {
        const message = getFirstMessage();
        if (message.mes) {
            chat.push(message);
            freshChat = true;
        }
        // Make sure the chat appears on the server
        await saveChatConditional(CHAT_COMMIT_REASON.MAINTENANCE);
    }
    await loadItemizedPrompts(getCurrentChatId());
    await printMessages({ frontendSourceHandoffEvent: event_types.CHAT_LOADED });
    select_selected_character(this_chid);

    await eventSource.emit(event_types.CHAT_CHANGED, (getCurrentChatId()));
    if (freshChat) await eventSource.emit(event_types.CHAT_CREATED);

    if (chat.length === 1) {
        const chat_id = (chat.length - 1);
        await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, 'first_message');
        await finalizeMessageContent(chat_id, event_types.CHARACTER_MESSAGE_RENDERED, 'first_message');
    }
}

function getFirstMessage() {
    const firstMes = characters[this_chid]?.first_mes || '';
    const alternateGreetings = characters[this_chid]?.data?.alternate_greetings;

    const message = {
        name: name2,
        is_user: false,
        is_system: false,
        send_date: getMessageTimeStamp(),
        mes: getRegexedString(firstMes, regex_placement.AI_OUTPUT),
        extra: {},
    };

    if (Array.isArray(alternateGreetings) && alternateGreetings.length > 0) {
        const swipes = [message.mes, ...(alternateGreetings.map(greeting => getRegexedString(greeting, regex_placement.AI_OUTPUT)))];

        if (!message.mes) {
            swipes.shift();
            message.mes = swipes[0];
        }

        message.swipe_id = 0;
        message.swipes = swipes;
        message.swipe_info = swipes.map(_ => ({
            send_date: message.send_date,
            gen_started: void 0,
            gen_finished: void 0,
            extra: {},
        }));
    }

    return message;
}

export async function openCharacterChat(fileName, avatar = characters[this_chid]?.avatar) {
    await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
    const characterId = characters.findIndex(character => character.avatar === avatar);
    if (characterId === -1) throw new Error(`Character not found: ${avatar}`);
    await selectCharacterById(characterId, { chatFile: fileName });
}

export function setUserName(value, { toastPersonaNameChange = true } = {}) {
    name1 = value;
    if (name1 === undefined || name1 == '')
        name1 = default_user_name;
    console.log(`User name changed to ${name1}`);
    $('#your_name').text(name1);
    if (toastPersonaNameChange && power_user.persona_show_notifications && !isPersonaPanelOpen()) {
        toastr.success(t`Your messages will now be sent as ${name1}`, t`Persona Changed`);
    }
    saveSettingsDebounced();
}

export async function saveSettings(loopCounter = 0) {
    if (settingsSavePromise) {
        settingsSaveQueued = true;
        return settingsSavePromise;
    }

    settingsSavePromise = (async () => {
        let result = false;
        try {
            do {
                settingsSaveQueued = false;
                result = await saveSettingsNow(loopCounter);
            } while (settingsSaveQueued && result);
            return result;
        } finally {
            settingsSavePromise = null;
            settingsSaveQueued = false;
        }
    })();

    return settingsSavePromise;
}

async function saveSettingsNow(loopCounter = 0) {
    if (!settingsReady) {
        console.warn('Settings not ready, scheduling another save');
        saveSettingsDebounced();
        return false;
    }

    const MAX_RETRIES = 3;
    if (TempResponseLength.isCustomized()) {
        if (loopCounter < MAX_RETRIES) {
            console.warn('Response length is currently being overridden, scheduling another save');
            saveSettingsDebounced(++loopCounter);
            return false;
        }
        console.error('Response length is currently being overridden, but the save loop has reached the maximum number of retries');
        TempResponseLength.restore(null);
    }

    const payload = {
        firstRun: firstRun,
        accountStorage: accountStorage.getState(),
        currentVersion: currentVersion,
        username: name1,
        active_character: active_character,
        active_group: active_group,
        user_avatar: user_avatar,
        amount_gen: amount_gen,
        max_context: max_context,
        main_api: main_api,
        world_info_settings: getWorldInfoSettings(),
        textgenerationwebui_settings: textgen_settings,
        swipes: swipes,
        horde_settings: horde_settings,
        power_user: power_user,
        extension_settings: extension_settings,
        tags: tags,
        tag_map: tag_map,
        nai_settings: nai_settings,
        kai_settings: kai_settings,
        oai_settings: oai_settings,
        background: background_settings,
        proxies: proxies,
        selected_proxy: selected_proxy,
    };

    try {
        const result = await saveSettingsSnapshot(payload, getRequestHeaders());
        settings = payload;
        await eventSource.emit(event_types.SETTINGS_UPDATED);
        if (result.personaErrors) {
            for (const [id, message] of Object.entries(result.personaErrors)) {
                toastr.error(`${id}: ${message}`, t`Persona could not be saved`);
            }
        }
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        if (isSettingsConflictError(error)) {
            toastr.error(t`Settings changed outside this page. Reload before saving again to prevent data loss.`, t`Settings could not be saved`);
        } else {
            toastr.error(t`Check the server connection and reload the page to prevent data loss.`, t`Settings could not be saved`);
        }
        return false;
    }
}

export function setGenerationParamsFromPreset(preset, adjustments) {
    const needsUnlock = (preset.max_length ?? max_context) > MAX_CONTEXT_DEFAULT || (preset.genamt ?? amount_gen) > MAX_RESPONSE_DEFAULT;
    $('#max_context_unlocked').prop('checked', needsUnlock).trigger('change');

    if (preset.genamt !== undefined) {
        amount_gen = preset.genamt;
        restoreNumericInput(document.getElementById('amount_gen'), amount_gen, adjustments, t`General`);
    }

    if (preset.max_length !== undefined) {
        max_context = preset.max_length;
        restoreNumericInput(document.getElementById('max_context'), max_context, adjustments, t`General`);
    }
}

export async function getPastCharacterChats(characterId = null) {
    characterId = characterId ?? parseInt(this_chid);
    if (!characters[characterId]) return [];

    const response = await fetch('/api/characters/chats', {
        method: 'POST',
        body: JSON.stringify({ avatar_url: characters[characterId].avatar }),
        headers: getRequestHeaders(),
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    if (typeof data === 'object' && data.error === true) {
        return [];
    }

    const chats = Object.values(data);
    return chats.sort((a, b) => a.file_name.localeCompare(b.file_name)).reverse();
}

export function getCurrentChatDetails() {
    if (!characters[this_chid] && !selected_group) {
        return { sessionName: '', group: null, characterName: '', avatarImgURL: '' };
    }

    const group = selected_group ? groups.find(x => x.id === selected_group) : null;
    const currentChat = selected_group ? group?.chat_id : characters[this_chid].chat;
    const displayName = selected_group ? group?.name : characters[this_chid].name;
    const avatarImg = selected_group ? group?.avatar_url : getThumbnailUrl('avatar', characters[this_chid].avatar);
    return { sessionName: currentChat, group: group, characterName: displayName, avatarImgURL: avatarImg };
}

export async function displayPastChats(hightlightNames = []) {
    const chatDetails = getCurrentChatDetails();
    const currentChat = chatDetails.sessionName;
    const groupId = selected_group;
    const avatar = groupId ? null : characters[this_chid]?.avatar;
    $('#ChatHistoryCharName').text(`${chatDetails.characterName} `);

    const debouncedDisplay = debounce((searchQuery) => {
        displayChats(searchQuery, currentChat, avatar, groupId, []);
    });

    // Define the search input listener
    $('#select_chat_search').off('input').on('input', function () {
        const searchQuery = $(this).val();
        debouncedDisplay(searchQuery);
    });

    await displayChats(String($('#select_chat_search').val()), currentChat, avatar, groupId, hightlightNames);
    addChatBackupsBrowser();
}

let chatHistoryOpener;

export async function setChatHistoryOpen(open) {
    const panel = document.getElementById('select_chat_popup');
    const shadow = document.getElementById('shadow_select_chat_popup');
    if (open === (shadow.style.display === 'block')) return;
    const focusInside = panel.contains(document.activeElement);
    if (open) {
        chatHistoryOpener = document.activeElement;
        $('#select_chat_div').empty();
        $('#select_chat_search').val('');
    }
    shadow.style.display = open ? 'block' : 'none';
    if (open) {
        await displayPastChats();
        if (shadow.style.display === 'block') {
            (isMobileHost() ? panel : document.getElementById('select_chat_search')).focus();
        }
    } else if (focusInside && chatHistoryOpener?.isConnected) {
        chatHistoryOpener.focus();
    }
}

async function displayChats(searchQuery, currentChat, avatar, groupId, highlightNames) {
    try {
        const response = await fetch('/api/chats/search', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                query: searchQuery,
                avatar_url: avatar,
                group_id: groupId || null,
            }),
        });

        if (!response.ok) {
            throw new Error(`Could not search chats: ${response.status} ${response.statusText}`);
        }

        const filteredData = await response.json();
        if (selected_group !== groupId || (!groupId && characters[this_chid]?.avatar !== avatar)) return;
        filteredData.sort((a, b) => sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)));

        const items = filteredData.map(chat => {
            const isSelected = currentChat === chat.file_name;
            const template = $('#past_chat_template .select_chat_block_wrapper').clone();
            template.attr({ 'data-avatar': avatar ?? '', 'data-group': groupId ?? '', 'data-file': chat.file_name });
            template.find('.select_chat_block').attr('file_name', chat.file_name);
            template.find('.select_chat_block_filename').text(chat.file_name);
            const primary = template.find('.select_chat_block')[0].querySelector(':scope > .sr-only');
            const name = template.find('.select_chat_block_filename')[0];
            setAriaRelation(primary, 'labelledby', name);
            setAriaRelation(primary, 'describedby', template.find('.select_chat_info')[0]);
            template.find('button:not(.sr-only)').each((_, button) => setAriaRelation(button, 'labelledby', button, name));
            if (isSelected) primary.setAttribute('aria-current', 'true');
            template.find('.chat_file_size').text(`(${chat.file_size},`);
            template.find('.chat_messages_num').empty().append(
                $('<span>', { 'aria-hidden': 'true', text: `${chat.message_count} 💬` }),
                $('<span>', { class: 'sr-only', text: t`Messages: ${chat.message_count}` }),
                ')',
            );
            template.find('.select_chat_block_mes').text(chat.preview_message);
            template.find('.PastChat_cross').attr('file_name', chat.file_name);
            template.find('.chat_messages_date').text(timestampToMoment(chat.last_mes).format('lll'));

            if (isSelected) {
                template.find('.select_chat_block').attr('highlight', String(true));
            }

            return template[0];
        });
        const retained = keepFocus(
            () => document.querySelectorAll('#select_chat_div > .select_chat_block_wrapper'),
            item => item.dataset.file,
            () => document.getElementById('select_chat_div').replaceChildren(...items),
        );
        if (!retained) document.getElementById('select_chat_search').focus();
        for (const item of items) {
            const template = $(item);
            const fileName = item.dataset.file;
            if (Array.isArray(highlightNames) && highlightNames.includes(fileName)) {
                const templateOffset = template.offset().top - template.parent().offset().top;
                $('#select_chat_div').scrollTop(templateOffset);
                flashHighlight(template, debounce_timeout.extended);
            }
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        toastr.error(error.message, t`Chat history could not be loaded.`);
    }
}

export function selectRightMenuWithAnimation(selectedMenuId) {
    const displayModes = {
        'rm_group_chats_block': 'flex',
        'rm_api_block': 'grid',
        'rm_characters_block': 'flex',
    };
    $('#result_info').toggle(selectedMenuId === 'rm_ch_create_block');
    document.querySelectorAll('#right-nav-panel .right_menu').forEach((menu) => {
        $(menu).css('display', 'none');

        if (selectedMenuId && selectedMenuId.replace('#', '') === menu.id) {
            const mode = displayModes[menu.id] ?? 'block';
            $(menu).css('display', mode);
            $(menu).css('opacity', 0.0);
            $(menu).transition({
                opacity: 1.0,
                duration: animation_duration,
                easing: animation_easing,
                complete: function () { },
            });
        }
    });
}

export function select_rm_info(type, charId, previousCharId = null) {
    if (!type) {
        toastr.error(t`Invalid process (no 'type')`);
        return;
    }
    if (type !== 'group_create') {
        var displayName = String(charId).replace('.png', '');
    }

    if (type === 'char_delete') {
        toastr.warning(t`Character Deleted: ${displayName}`);
    }
    if (type === 'char_create') {
        toastr.success(t`Character Created: ${displayName}`);
    }
    if (type === 'group_create') {
        toastr.success(t`Group Created`);
    }
    if (type === 'group_delete') {
        toastr.warning(t`Group Deleted`);
    }

    if (type === 'char_import') {
        toastr.success(t`Character Imported: ${displayName}`);
    }

    selectRightMenuWithAnimation('rm_characters_block');

    // Set a timeout so multiple flashes don't overlap
    clearTimeout(importFlashTimeout);
    importFlashTimeout = setTimeout(function () {
        if (type === 'char_import' || type === 'char_create' || type === 'char_import_no_toast') {
            // Find the page at which the character is located
            const avatarFileName = charId;
            const charData = getEntitiesList({ doFilter: true });
            const charIndex = charData.findIndex((x) => x?.item?.avatar?.startsWith(avatarFileName));

            if (charIndex === -1) {
                console.log(`Could not find character ${charId} in the list`);
                return;
            }

            try {
                const page = getPageForItem(charIndex, characterPagination);
                const selector = `#rm_print_characters_block [title*="${avatarFileName}"]`;
                $('#rm_print_characters_pagination').pagination('go', page);

                waitUntilCondition(() => document.querySelector(selector) !== null).then(() => {
                    const element = $(selector).parent();

                    if (element.length === 0) {
                        console.log(`Could not find element for character ${charId}`);
                        return;
                    }

                    const scrollOffset = element.offset().top - element.parent().offset().top;
                    element.parent().scrollTop(scrollOffset);
                    flashHighlight(element, 5000);
                });
            } catch (e) {
                console.error(e);
            }
        }

        if (type === 'group_create') {
            // Find the page at which the character is located
            const charData = getEntitiesList({ doFilter: true });
            const charIndex = charData.findIndex((x) => String(x?.item?.id) === String(charId));

            if (charIndex === -1) {
                console.log(`Could not find group ${charId} in the list`);
                return;
            }

            const page = getPageForItem(charIndex, characterPagination);
            $('#rm_print_characters_pagination').pagination('go', page);
            const selector = `#rm_print_characters_block [grid="${charId}"]`;
            try {
                waitUntilCondition(() => document.querySelector(selector) !== null).then(() => {
                    const element = $(selector);
                    const scrollOffset = element.offset().top - element.parent().offset().top;
                    element.parent().scrollTop(scrollOffset);
                    flashHighlight(element, 5000);
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, 250);

    if (previousCharId) {
        const newId = characters.findIndex((x) => x.avatar == previousCharId);
        if (newId >= 0) {
            setCharacterId(newId);
        }
    }
}

export function select_selected_character(chid, { switchMenu = true } = {}) {
    //character select
    //console.log('select_selected_character() -- starting with input of -- ' + chid + ' (name:' + characters[chid].name + ')');
    select_rm_create({ switchMenu });
    switchMenu && setMenuType('character_edit');
    $('#delete_button').css('display', 'flex');
    $('#export_button').css('display', 'flex');

    //create text poles
    $('#rm_button_back').css('display', 'none');
    //$("#character_import_button").css("display", "none");
    $('#create_button').attr('value', 'Save');              // what is the use case for this?
    $('#dupe_button').show();
    $('#create_button_label').css('display', 'none');
    $('#char_connections_button').show();

    // Hide the chat scenario button if we're peeking the group member defs
    $('#set_chat_character_settings').toggle(!selected_group);

    // Don't update the navbar name if we're peeking the group member defs
    if (!selected_group) {
        setSelectedCharacterName(characters[chid].name);
    }

    $('#add_avatar_button').val('');

    $('#character_popup-button-h3').text(characters[chid].name);
    $('#character_name_pole').val(characters[chid].name).removeAttr('aria-invalid');
    $('#description_textarea').val(characters[chid].description);
    $('#character_world').val(characters[chid].data?.extensions?.world || '');
    $('#creator_notes_textarea').val(characters[chid].data?.creator_notes || characters[chid].creatorcomment);
    $('#creator_notes_spoiler').html(formatCreatorNotes(characters[chid].data?.creator_notes || characters[chid].creatorcomment, characters[chid].avatar));
    $('#character_version_textarea').val(characters[chid].data?.character_version || '');
    $('#system_prompt_textarea').val(characters[chid].data?.system_prompt || '');
    $('#post_history_instructions_textarea').val(characters[chid].data?.post_history_instructions || '');
    $('#tags_textarea').val(Array.isArray(characters[chid].data?.tags) ? characters[chid].data.tags.join(', ') : '');
    $('#creator_textarea').val(characters[chid].data?.creator);
    $('#character_version_textarea').val(characters[chid].data?.character_version || '');
    $('#personality_textarea').val(characters[chid].personality);
    $('#firstmessage_textarea').val(characters[chid].first_mes);
    $('#scenario_pole').val(characters[chid].scenario);
    $('#depth_prompt_prompt').val(characters[chid].data?.extensions?.depth_prompt?.prompt ?? '');
    $('#depth_prompt_depth').val(characters[chid].data?.extensions?.depth_prompt?.depth ?? depth_prompt_depth_default);
    $('#depth_prompt_role').val(characters[chid].data?.extensions?.depth_prompt?.role ?? depth_prompt_role_default);
    $('#talkativeness_slider').val(characters[chid].talkativeness || talkativeness_default);
    $('#mes_example_textarea').val(characters[chid].mes_example);
    $('#selected_chat_pole').val(characters[chid].chat);
    $('#create_date_pole').val(timestampToMoment(characters[chid].create_date).toISOString());
    $('#avatar_url_pole').val(characters[chid].avatar);
    $('#chat_import_avatar_url').val(characters[chid].avatar);
    $('#chat_import_character_name').val(characters[chid].name);
    $('#character_json_data').val(characters[chid].json_data);

    updateFavButtonState(characters[chid].fav || characters[chid].fav == 'true');

    const avatarUrl = characters[chid].avatar != 'none' ? getThumbnailUrl('avatar', characters[chid].avatar) : default_avatar;
    $('#avatar_load_preview').attr('src', avatarUrl);
    $('.open_alternate_greetings').data('chid', chid);
    $('#set_character_world').data('chid', chid);
    setWorldInfoButtonClass(chid);
    checkEmbeddedWorld(chid);

    $('#name_div').removeClass('displayBlock');
    $('#name_div').addClass('displayNone');
    $('#renameCharButton').css('display', '');

    $('#form_create').attr('actiontype', 'editcharacter');
    $('.form_create_bottom_buttons_block .chat_lorebook_button').show();

    const externalMediaState = isExternalMediaAllowed();
    $('#character_open_media_overrides').toggle(!selected_group);
    $('#character_media_allowed_icon').toggle(externalMediaState);
    $('#character_media_forbidden_icon').toggle(!externalMediaState);

    // Update some stuff about the char management dropdown
    $('#character_source').attr('disabled', !getCharacterSource(chid) ? '' : null);

    eventSource.emit(event_types.CHARACTER_EDITOR_OPENED, chid);

    saveSettingsDebounced();
}

function select_rm_create({ switchMenu = true } = {}) {
    switchMenu && setMenuType('create');

    //console.log('select_rm_Create() -- selected button: '+selected_button);
    if (selected_button == 'create' && create_save.avatar) {
        const addAvatarInput = /** @type {HTMLInputElement} */ ($('#add_avatar_button').get(0));
        addAvatarInput.files = create_save.avatar;
        read_avatar_load(addAvatarInput);
    }

    switchMenu && selectRightMenuWithAnimation('rm_ch_create_block');

    $('#set_chat_character_settings').hide();
    $('#delete_button_div').css('display', 'none');
    $('#delete_button').css('display', 'none');
    $('#export_button').css('display', 'none');
    $('#create_button_label').css('display', '');
    $('#create_button').attr('value', 'Create');
    $('#dupe_button').hide();
    $('#char_connections_button').hide();

    //create text poles
    $('#rm_button_back').css('display', '');
    $('#character_import_button').css('display', '');
    $('#character_popup-button-h3').text('Create character');
    $('#character_name_pole').val(create_save.name).removeAttr('aria-invalid');
    $('#description_textarea').val(create_save.description);
    $('#character_world').val(create_save.world);
    $('#creator_notes_textarea').val(create_save.creator_notes);
    $('#creator_notes_spoiler').html(formatCreatorNotes(create_save.creator_notes, ''));
    $('#post_history_instructions_textarea').val(create_save.post_history_instructions);
    $('#system_prompt_textarea').val(create_save.system_prompt);
    $('#tags_textarea').val(create_save.tags);
    $('#creator_textarea').val(create_save.creator);
    $('#character_version_textarea').val(create_save.character_version);
    $('#personality_textarea').val(create_save.personality);
    $('#firstmessage_textarea').val(create_save.first_message);
    $('#talkativeness_slider').val(create_save.talkativeness);
    $('#scenario_pole').val(create_save.scenario);
    $('#depth_prompt_prompt').val(create_save.depth_prompt_prompt);
    $('#depth_prompt_depth').val(create_save.depth_prompt_depth);
    $('#depth_prompt_role').val(create_save.depth_prompt_role);
    $('#mes_example_textarea').val(create_save.mes_example);
    $('#character_json_data').val('');
    $('#avatar_div').css('display', 'flex');
    $('#avatar_load_preview').attr('src', default_avatar);
    $('#renameCharButton').css('display', 'none');
    $('#name_div').removeClass('displayNone');
    $('#name_div').addClass('displayBlock');
    $('.open_alternate_greetings').data('chid', -1);
    $('#set_character_world').data('chid', -1);
    setWorldInfoButtonClass(undefined, !!create_save.world);
    updateFavButtonState(false);
    checkEmbeddedWorld();

    $('#form_create').attr('actiontype', 'createcharacter');
    $('.form_create_bottom_buttons_block .chat_lorebook_button').hide();
    $('#character_open_media_overrides').hide();
}

function select_rm_characters() {
    const doFullRefresh = menu_type === 'characters';
    setMenuType('characters');
    selectRightMenuWithAnimation('rm_characters_block');
    printCharacters(doFullRefresh);
}

export function setExtensionPrompt(key, value, position, depth, scan = false, role = extension_prompt_roles.SYSTEM, filter = null) {
    extension_prompts[key] = {
        value: String(value),
        position: Number(position),
        depth: Number(depth),
        scan: !!scan,
        role: Number(role ?? extension_prompt_roles.SYSTEM),
        filter: filter,
    };
}

export function getExtensionPromptRoleByName(roleName) {
    // If the role is already a valid number, return it
    if (typeof roleName === 'number' && Object.values(extension_prompt_roles).includes(roleName)) {
        return roleName;
    }

    switch (roleName) {
        case 'system':
            return extension_prompt_roles.SYSTEM;
        case 'user':
            return extension_prompt_roles.USER;
        case 'assistant':
            return extension_prompt_roles.ASSISTANT;
    }

    // Skill issue?
    return extension_prompt_roles.SYSTEM;
}

export function removeDepthPrompts() {
    for (const key of Object.keys(extension_prompts)) {
        if (key.startsWith(inject_ids.DEPTH_PROMPT)) {
            delete extension_prompts[key];
        }
    }
}

export function updateChatMetadata(newValues, reset) {
    chat_metadata = reset ? { ...newValues } : { ...chat_metadata, ...newValues };
}

function updateFavButtonState(state) {
    // Update global state of the flag
    // TODO: This is bad and needs to be refactored.
    fav_ch_checked = state;
    $('#fav_checkbox').prop('checked', state);
    $('#favorite_button').toggleClass('fav_on', state).attr('aria-pressed', String(state));
    $('#favorite_button').toggleClass('fav_off', !state);
}

export async function setCharacterSettingsOverrides() {
    if (!selected_group && (this_chid === undefined || !characters[this_chid])) {
        console.warn('setCharacterSettingsOverrides() -- no selected group or character');
        return;
    }

    const scenarioOverrideValue = chat_metadata.scenario || '';
    const exampleMessagesValue = chat_metadata.mes_example || '';
    const systemPromptValue = chat_metadata.system_prompt || '';
    const isGroup = !!selected_group;

    const $template = $(await renderTemplateAsync('scenarioOverride'));
    $template.find('[data-group="true"]').toggle(isGroup);
    $template.find('[data-character="true"]').toggle(!isGroup);
    const pendingChanges = {
        scenario: scenarioOverrideValue,
        examples: exampleMessagesValue,
        system_prompt: systemPromptValue,
    };

    // Keep edits local until the popup is closed/confirmed
    const $scenario = $template.find('.chat_scenario');
    $scenario.val(scenarioOverrideValue).on('input', function () {
        pendingChanges.scenario = String($(this).val());
    });
    const $examples = $template.find('.chat_examples');
    $examples.val(exampleMessagesValue).on('input', function () {
        pendingChanges.examples = String($(this).val());
    });
    const $systemPrompt = $template.find('.chat_system_prompt');
    $systemPrompt.val(systemPromptValue).on('input', function () {
        pendingChanges.system_prompt = String($(this).val());
    });

    $template.find('.remove_scenario_override').on('click', async function () {
        const confirm = await Popup.show.confirm(t`Are you sure you want to remove all overrides?`, t`This action cannot be undone.`);
        if (!confirm) {
            return;
        }

        $scenario.val('');
        pendingChanges.scenario = '';
        $examples.val('');
        pendingChanges.examples = '';
        $systemPrompt.val('');
        pendingChanges.system_prompt = '';
    });

    // Wait for popup close/confirm.
    await callGenericPopup($template, POPUP_TYPE.TEXT, '', {
        label: $template.find('h3')[0],
        wide: true,
        large: true,
        allowVerticalScrolling: true,
    });

    chat_metadata.scenario = pendingChanges.scenario;
    chat_metadata.mes_example = pendingChanges.examples;
    chat_metadata.system_prompt = pendingChanges.system_prompt;
    await saveMetadata();
}

export function callPopup(text, type, inputValue = '', { okButton, rows, wide, wider, large, allowHorizontalScrolling, allowVerticalScrolling, cropAspect } = {}) {
    function getOkButtonText() {
        if (['text', 'char_not_selected'].includes(popup_type)) {
            $dialoguePopupCancel.css('display', 'none');
            return okButton ?? t`Ok`;
        } else if (['delete_extension'].includes(popup_type)) {
            return okButton ?? t`Ok`;
        } else if (['new_chat', 'confirm'].includes(popup_type)) {
            return okButton ?? t`Yes`;
        } else if (['input'].includes(popup_type)) {
            return okButton ?? t`Save`;
        }
        return okButton ?? t`Delete`;
    }

    dialogueCloseStop = true;
    if (type) {
        popup_type = type;
    }

    const $dialoguePopup = $('#dialogue_popup');
    const $dialoguePopupCancel = $('#dialogue_popup_cancel');
    const $dialoguePopupOk = $('#dialogue_popup_ok');
    const $dialoguePopupInput = $('#dialogue_popup_input');
    const $dialoguePopupText = $('#dialogue_popup_text');
    const $shadowPopup = $('#shadow_popup');

    $dialoguePopup.toggleClass('wide_dialogue_popup', !!wide)
        .toggleClass('wider_dialogue_popup', !!wider)
        .toggleClass('large_dialogue_popup', !!large)
        .toggleClass('horizontal_scrolling_dialogue_popup', !!allowHorizontalScrolling)
        .toggleClass('vertical_scrolling_dialogue_popup', !!allowVerticalScrolling);

    $dialoguePopupCancel.css('display', 'inline-block');
    $dialoguePopupOk.text(getOkButtonText());
    $dialoguePopupInput.toggle(popup_type === 'input').val(inputValue).attr('rows', rows ?? 1);
    $dialoguePopupText.empty().append(text);
    $shadowPopup.css('display', 'block');

    if (popup_type == 'input') {
        $dialoguePopupInput.trigger('focus');
    }

    $shadowPopup.transition({
        opacity: 1,
        duration: animation_duration,
        easing: animation_easing,
    });

    return new Promise((resolve) => {
        dialogueResolve = resolve;
    });
}

export async function updateSwipeCounter(mesId, { message = undefined, messageElement = undefined } = {}) {
    message ??= chat[mesId];
    messageElement ??= chatElement.children('.mes').filter(`[mesid="${mesId}"]`);

    //If the message does not have swipes, create them.
    if (ensureSwipes(message)) {
        syncMesToSwipe(mesId);
    }

    const swipeCounterText = formatSwipeCounter((message?.swipe_id + 1), message?.swipes?.length);
    const swipeCounter = messageElement.find('.swipes-counter');
    const swipePickerButton = messageElement.find('.mes_swipe_picker');
    const canOpenSwipePicker = canOpenSwipePickerForMessage(mesId);
    const canJumpToSwipe = canJumpToSwipeForMessage(mesId);
    const swipeAction = canJumpToSwipe ? t`Click to jump to a swipe` : canOpenSwipePicker ? t`Click to view swipe history` : null;

    swipeCounter
        .text(swipeCounterText)
        .prop('hidden', false)
        .toggleClass('swipe-picker-enabled', canOpenSwipePicker)
        .toggleClass(INTERACTABLE_CONTROL_CLASS, canOpenSwipePicker)
        .attr('role', canOpenSwipePicker ? 'button' : null)
        .attr('aria-label', swipeAction)
        .attr('aria-description', canOpenSwipePicker ? swipeCounterText : null)
        .attr('title', swipeAction);
    swipePickerButton.toggle(canOpenSwipePicker);

    if (!canOpenSwipePicker) {
        swipeCounter.removeAttr('tabindex');
    }
}

export function isSwipingAllowed() {
    return (
        //Swipe cannot be called on an empty chat.
        chat.length !== 0 &&
        //The swipes setting must be enabled, and swipes can't be hidden.
        swipes && !swipesHidden &&
        //Cannot swipe while generating.
        !isGenerating() &&
        //If mid-swipe, the message cannot be swiped.
        swipeState === SWIPE_STATE.NONE
    );
}

export function isMessageSwipeable(messageId, message = undefined) {
    message ??= chat[messageId];

    //If the message does not have swipes, create them.
    if (ensureSwipes(message)) {
        syncMesToSwipe(messageId);
    }

    if (
        //Only messages below the currently edited message can be swiped, if it's not mid-swipe edit.
        ((messageId > (this_edit_mes_id ?? -1)) && (swipeState != SWIPE_STATE.EDITING)) &&

        //If the message is the last message, and it exists.
        (messageId === chat.length - 1) &&
        (message &&
            message.role !== 'tool' &&
            !Array.isArray(message.tool_calls) &&
            //Small system messages cannot be swiped.
            !(message?.extra?.isSmallSys) &&
            //Some messages, like the welcome screen, are not swipeable.
            !(message?.extra?.swipeable === false) &&
            //User messages are not swipeable.
            !message.is_user
        )
    ) {
        // The message is swipeable.
        return true;
    } else {
        // The message is not swipeable.
        return false;
    }
}

export function getOverswipeBehavior(messageId, message = undefined) {
    message ??= chat[messageId];

    const isPristine = !chat_metadata?.tainted;
    const isGreeting = messageId === 0;

    //Do not override explicitly set overswipe_behavior.
    if (typeof message?.extra?.overswipe_behavior == 'string') return message.extra.overswipe_behavior;
    //Some messages, like the welcome screen, are not swipeable.
    else if (message?.extra?.swipeable === false) return OVERSWIPE_BEHAVIOR.NONE;
    //Small System messages can't be swiped.
    else if (message?.extra?.isSmallSys) return OVERSWIPE_BEHAVIOR.NONE;
    //The first message in a priistine chat will loop. It's chevrons will always be visible https://github.com/SillyTavern/SillyTavern/pull/4712#issuecomment-3557893373
    else if (isGreeting && isPristine) return OVERSWIPE_BEHAVIOR.PRISTINE_GREETING;
    //Non-user and non-prompt hidden messages will regenerate.
    else if (!message?.is_user && !message?.is_system) return OVERSWIPE_BEHAVIOR.REGENERATE;
    //By default, all other messages will loop. Their swipe chevrons will only be shown if there is more than one swipe.
    else { return OVERSWIPE_BEHAVIOR.LOOP; }
}

export function refreshSwipeButtons(updateCounters = false, fade = true) {
    if (!syncSwipeButtonVisibility()) return false;

    swipeableMessageId = null;
    refreshSwipeButtonElements(chatElement.children('.mes[mesid]'), updateCounters, fade);
}

function syncSwipeButtonVisibility() {
    //Never show swipe buttons on an empty chat.
    if (chat?.length === 0) return false;

    const allowed = isSwipingAllowed();
    $('body').toggleClass('hideAllSwipeButtons', !allowed);
    return allowed;
}

function refreshSwipeButtonElements(messageElements, updateCounters, fade) {
    //Group each message.
    messageElements.each((_index, div) => {
        const messageId = Number(div.getAttribute('mesid'));

        const message = chat[messageId];

        //Chevrons should not fade-in during printMessages. //https://github.com/SillyTavern/SillyTavern/pull/4712#issuecomment-3539315919
        div.classList.toggle('fade', fade);

        if (isMessageSwipeable(messageId, message)) {
            swipeableMessageId = messageId;

            //If a right swipe would trigger a generation or loop to the first swipe.
            const isLastSwipe = (message?.swipes?.length ?? 1) - 1 <= (message?.swipe_id ?? 0);
            const hasSwipes = (message?.swipes?.length > 1);
            const overswipe = getOverswipeBehavior(messageId, message);
            const swipePickerButton = $(div).find('.mes_swipe_picker');
            const canOpenSwipePicker = canOpenSwipePickerForMessage(messageId);

            // Chevrons should always be shown on pristine greetings: https://github.com/SillyTavern/SillyTavern/pull/4712#issuecomment-3557893373
            const pristineGreeting = overswipe == OVERSWIPE_BEHAVIOR.PRISTINE_GREETING;

            //The swipe button will be shown if an overswipe would trigger REGENERATE or EDIT_GENERATE.
            const isOverswipeable = isLastSwipe &&
                overswipe == OVERSWIPE_BEHAVIOR.REGENERATE ||
                overswipe == OVERSWIPE_BEHAVIOR.EDIT_GENERATE;

            div.classList.toggle('last_swipe', isOverswipeable);

            //If there's only one swipe, the left arrow should not be shown.
            div.classList.toggle('swipes_visible', hasSwipes || pristineGreeting);
            swipePickerButton.toggle(canOpenSwipePicker);

            //updateSwipeCounter does not need to be awaited, It can run a bit later.
            if (updateCounters) updateSwipeCounter(messageId, { message, messageElement: $(div) });
        } else {
            if (swipeableMessageId === messageId) swipeableMessageId = null;

            //Hide all messages that are not swipeable.
            div.classList.remove('swipes_visible', 'last_swipe');
            $(div).find('.mes_swipe_picker').toggle(canOpenSwipePickerForMessage(messageId));
        }
    });
}

export function refreshActiveSwipeButtons(messageIds = [], fade = true) {
    if (!syncSwipeButtonVisibility()) return false;

    const changedMessageIds = new Set();
    if (swipeableMessageId !== null) changedMessageIds.add(swipeableMessageId);
    changedMessageIds.add(chat.length - 1);
    for (const messageId of messageIds) {
        changedMessageIds.add(messageId);
    }

    const messageElements = [...changedMessageIds]
        .map(messageId => chatSurface.getMessageElement(messageId))
        .filter(Boolean);
    refreshSwipeButtonElements($(messageElements), false, fade);
}

export function showSwipeButtons() {
    swipesHidden = false;
    refreshActiveSwipeButtons();
}

export function hideSwipeButtons({ hideCounters = false } = {}) {
    swipesHidden = true;
    refreshActiveSwipeButtons();

    if (hideCounters === true) {
        chatElement.find('.last_mes .swipes-counter').prop('hidden', true);
    }
}

export async function deleteSwipe(swipeId = null, messageId = chat.length - 1) {
    if (swipeId != null) {
        swipeId = Number(swipeId);
        if (!Number.isInteger(swipeId) || swipeId < 0) {
            toastr.warning(t`Invalid swipe ID.`);
            return;
        }
    }

    const message = chat[messageId];
    if (!message || !Array.isArray(message.swipes) || !message.swipes.length) {
        toastr.warning(t`No messages to delete swipes from.`);
        return;
    }

    if (message.swipes.length <= 1) {
        toastr.warning(t`Can't delete the last swipe.`);
        return;
    }

    swipeId = Number(swipeId ?? message.swipe_id ?? 0);
    const currentSwipeId = clamp(Number(message.swipe_id ?? 0), 0, message.swipes.length - 1);

    if (!Number.isInteger(swipeId) || swipeId < 0 || swipeId >= message.swipes.length) {
        toastr.warning(t`Invalid swipe ID: ${swipeId + 1}`);
        return;
    }

    if (!await hydrateChatMessageSwipes(messageId)) return;

    let newSwipeId;
    if (swipeId < currentSwipeId) {
        newSwipeId = currentSwipeId - 1;
    } else if (swipeId > currentSwipeId) {
        newSwipeId = currentSwipeId;
    } else {
        // Select the next swipe, or the one before if it was the last one.
        newSwipeId = Math.min(swipeId, message.swipes.length - 2);
        const replacementSwipeId = newSwipeId < swipeId ? newSwipeId : newSwipeId + 1;
        if (typeof message.swipes[replacementSwipeId] !== 'string') {
            toastr.warning(t`Invalid swipe ID: ${replacementSwipeId + 1}`);
            return;
        }
    }

    const deletedAgentStateIds = collectAgentPersistStateIdsFromExtra(message.swipe_info?.[swipeId]?.extra);
    message.swipes.splice(swipeId, 1);

    if (Array.isArray(message.swipe_info) && message.swipe_info.length) {
        message.swipe_info.splice(swipeId, 1);
    }

    chat_metadata.tainted = true;

    messageId = Number(messageId);
    swipeId = Number(swipeId);
    message.swipe_id = newSwipeId;
    const deletedCurrentSwipe = swipeId === currentSwipeId;
    if (deletedCurrentSwipe && !syncSwipeToMes(messageId, newSwipeId, message)) {
        throw new Error(`Failed to select swipe ${newSwipeId} after deleting swipe ${swipeId} from message ${messageId}`);
    }
    await eventSource.emit(event_types.MESSAGE_SWIPE_DELETED, { messageId, swipeId, newSwipeId });

    if (deletedCurrentSwipe && chatSurface.getMessageElement(messageId)) {
        const direction = (swipeId <= newSwipeId) ? SWIPE_DIRECTION.RIGHT : SWIPE_DIRECTION.LEFT;
        // Animate swipe and swap displayed message when the currently visible swipe was deleted.
        await swipe(null, direction, { source: SWIPE_SOURCE.DELETE, repeated: false, forceMesId: messageId, forceSwipeId: newSwipeId });
    } else {
        if (deletedCurrentSwipe) {
            await eventSource.emit(event_types.MESSAGE_SWIPED, messageId);
        }
        await updateSwipeCounter(messageId);
        if (messageId !== chat.length - 1) {
            await updateSwipeCounter(chat.length - 1);
        }
        refreshActiveSwipeButtons([messageId]);
    }

    await saveChatConditional();
    await pruneAgentPersistentStatesAfterDeletion(deletedAgentStateIds);

    return newSwipeId;
}

export async function saveMetadata() {
    if (selected_group) {
        return saveGroupMetadata(selected_group);
    }
    if (this_chid === undefined) {
        return;
    }

    return enqueueMergeableSave({ scope: 'metadata', task: () => runChatSave({
        title: t`Chat could not be saved`,
        save: () => {
            const character = characters[this_chid];
            return saveCharacterChatMetadata({
                characterName: character.name,
                avatarUrl: character.avatar,
                fileName: character.chat,
                chatMetadata: persistedChatMetadata(),
            });
        },
        recover: () => saveChatUnsafe({ force: true }),
    }) });
}

export async function saveChatConditional(commitReason = CHAT_COMMIT_REASON.MUTATION) {
    // A full save includes all pending chat and metadata edits; later edits schedule new saves.
    cancelDebouncedChatSave();
    cancelDebouncedMetadataSave();

    const savePromise = selected_group
        ? saveGroupChat(selected_group, true, false, commitReason)
        : saveChat({ commitReason });

    // Keep itemized prompt persistence serialized with chat writes to avoid
    // chat switches corrupting per-chat IndexedDB state.
    const chatId = getCurrentChatId();
    const itemizedPromptsSnapshot = captureItemizedPromptsSaveSnapshot(chatId);
    const postSavePromise = enqueueChatSave(() => saveItemizedPrompts(chatId, {
        entriesSnapshot: itemizedPromptsSnapshot,
        cloneFromActive: false,
    }));

    // [MUTATION-ASYNC-TOGGLE-20260827] 异步开关：由酒馆助手脚本 QR 按钮切换，运行时生效、无需重启。
    // 状态存 extension_settings.tavernHelperToggle.mutationAsync，默认关（同步）。
    if (isMutationAsyncEnabled()) {
        // Fire-and-forget post-save so the UI does not block on IndexedDB writes.
        // Snapshots are captured above, so chat switch safety is preserved.
        postSavePromise.catch((error) => {
            console.warn('[BYPASS-PERF-FIREFORGET] Background post-save failed:', error);
        });

        // 上游在保存末尾持久化当前聊天的 token 计数；异步模式下同样不阻塞主线程。
        saveTokenCache().catch((error) => {
            console.warn('[BYPASS-PERF-FIREFORGET] Background token cache save failed:', error);
        });

        // saveChat fire-and-forget：主线程不等 HTTP 写盘（94MB chat 全量重写阻塞 3~4.5 分钟）
        fireAndForgetSaveChat(savePromise, commitReason);
    } else {
        // 同步模式（默认）：恢复原始行为，等 chat 文件 + token/itemized 都写盘完成再返回
        await Promise.all([savePromise, postSavePromise, saveTokenCache()]);
    }
}

export async function importCharacterChat(formData, { refresh = true } = {}) {
    const fetchResult = await fetch('/api/chats/import', {
        method: 'POST',
        body: formData,
        headers: getRequestHeaders({ omitContentType: true }),
        cache: 'no-cache',
    });

    if (fetchResult.ok) {
        const data = await fetchResult.json();
        if (data.res && refresh) {
            await displayPastChats();
        }
        return data?.fileNames || [];
    }

    return [];
}

export function updateViewMessageIds() {
    reconcileMountedChatSurface();
    updateEditArrowClasses();
}

function syncMountedDeleteState(messageIds) {
    for (const messageId of messageIds) {
        const element = chatSurface.getMessageElement(messageId);
        const checkbox = element?.querySelector(':scope > .del_checkbox');
        const placeholder = element?.querySelector(':scope > .for_checkbox');
        if (!(element instanceof HTMLElement) || !(checkbox instanceof HTMLInputElement) || !(placeholder instanceof HTMLElement)) {
            throw new Error(`Message ${messageId} is missing delete-mode controls`);
        }

        const selected = is_delete_mode && this_del_mes >= 0 && messageId >= this_del_mes;
        element.classList.toggle('selected', selected);
        checkbox.checked = selected;
        checkbox.style.display = is_delete_mode ? 'grid' : 'none';
        placeholder.style.display = is_delete_mode ? 'none' : 'block';
    }
}

function syncStylePinsOnProjectionEdge(messageIds) {
    const nextState = {
        firstMessage: chat[0] ?? null,
        firstMessageMounted: messageIds.includes(0),
    };
    if (
        stylePinProjectionState?.firstMessage === nextState.firstMessage
        && stylePinProjectionState.firstMessageMounted === nextState.firstMessageMounted
    ) {
        return;
    }
    stylePinProjectionState = nextState;
    applyStylePins();
}

function syncMountedChatViewState(messageIds) {
    if (messageIds.length > 0) {
        applyCharacterTagsToMessageDivs({ mesIds: messageIds });
    }
    syncMountedDeleteState(messageIds);
    refreshActiveSwipeButtons(messageIds);
    syncStylePinsOnProjectionEdge(messageIds);
    syncLastInContextMessageMarker();
    updateEditArrowClasses();
}

function shouldUseBoundedChatSurface() {
    return chatSurface.isBoundedView();
}

function reconcileMountedChatSurface(options = {}) {
    return chatSurface.reconcileMounted(options);
}

export function resetChatSurfaceView({ includeAuxiliary = false } = {}) {
    stylePinProjectionState = null;
    swipeableMessageId = null;
    return chatSurface.resetEpoch({ includeAuxiliary });
}

export function rerenderChatMessage(messageId) {
    return chatSurface.rerenderMessage(messageId);
}

export function isBoundedChatSurfaceView() {
    return shouldUseBoundedChatSurface();
}

export function jumpBoundedChatSurfaceToMessage(messageId) {
    return chatSurface.jumpToMessage(messageId);
}

export function syncChatSurfaceProjectionHold() {
    chatSurface.setProjectionHeld(
        chatSurfaceStructureMutationDepth > 0
        || Number.isInteger(this_edit_mes_id)
        || document.querySelector('.reasoning_edit_textarea') !== null,
    );
}

export async function withChatSurfaceStructureMutation(callback) {
    if (typeof callback !== 'function') {
        throw new TypeError('ChatSurface structure mutation requires a callback');
    }
    chatSurfaceStructureMutationDepth++;
    syncChatSurfaceProjectionHold();
    try {
        return await callback();
    } catch (error) {
        reconcileMountedChatSurface();
        throw error;
    } finally {
        chatSurfaceStructureMutationDepth--;
        syncChatSurfaceProjectionHold();
    }
}

export function getChatScrollTop() {
    return chatSurface.scroll.top();
}

export function getChatScrollHeight() {
    return chatSurface.scroll.height();
}

export function setChatScrollTop(top) {
    chatSurface.scroll.setTop(top);
}

export function offsetChatScrollTop(offset) {
    chatSurface.scroll.offsetTop(offset);
}

export function scrollChatSurfaceTo(options) {
    chatSurface.scroll.scrollTo(options);
}

export function animateChatScrollTop(top, duration) {
    chatSurface.scroll.animateTop(top, duration);
}

export function getFirstDisplayedMessageId() {
    const allIds = Array.from(document.querySelectorAll('#chat > .mes[mesid]')).map(el => Number(el.getAttribute('mesid'))).filter(x => !isNaN(x));
    const minId = Math.min(...allIds);
    return minId;
}

export function updateEditArrowClasses() {
    if (!(this_edit_mes_id >= 0)) {
        return;
    }

    const message = chatElement.children('.mes').filter(`.mes[mesid="${this_edit_mes_id}"]`);

    const downButton = message.find('.mes_edit_down');
    const upButton = message.find('.mes_edit_up');
    const copyButton = message.find('.mes_edit_copy');
    const deleteButton = message.find('.mes_edit_delete');
    copyButton.removeClass('disabled');
    deleteButton.removeClass('disabled');

    const messageId = Number(this_edit_mes_id);
    const mountedIds = new Set(chatSurface.getMountedMessageIds());
    const downDisabled = !mountedIds.has(messageId + 1);
    const upDisabled = !mountedIds.has(messageId - 1);
    downButton.toggleClass('disabled', downDisabled).attr('aria-disabled', String(downDisabled));
    upButton.toggleClass('disabled', upDisabled).attr('aria-disabled', String(upDisabled));
}

export function closeMessageEditor(what = 'all') {
    if (what === 'message' || what === 'all') {
        if (this_edit_mes_id >= 0) {
            chatElement.find(`.mes[mesid="${this_edit_mes_id}"] .mes_edit_cancel`).trigger('click');
        }
    }
    if (what === 'reasoning' || what === 'all') {
        document.querySelectorAll('.reasoning_edit_textarea').forEach((el) => {
            const cancelButton = el.closest('.mes')?.querySelector('.mes_reasoning_edit_cancel');
            if (cancelButton instanceof HTMLElement) {
                cancelButton.click();
            }
        });
    }
}

export function setGenerationProgress(progress) {
    if (!progress) {
        $('#send_textarea').css({ 'background': '', 'transition': '' });
    } else {
        $('#send_textarea').css({
            'background': `linear-gradient(90deg, #008000d6 ${progress}%, transparent ${progress}%)`,
            'transition': '0.25s ease-in-out',
        });
    }
}

export function cancelTtsPlay() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
}

export async function createOrEditCharacter(e) {
    if (!settingsReady) {
        console.warn('Settings not ready, aborting character creation/editing.');
        return;
    }

    $('#rm_info_avatar').html('');
    const formData = new FormData(/** @type {HTMLFormElement} */($('#form_create').get(0)));
    formData.set('fav', String(fav_ch_checked));
    const isNewChat = e instanceof CustomEvent && e.type === 'newChat';

    const rawFile = formData.get('avatar');
    if (rawFile instanceof File) {
        const convertedFile = await ensureImageFormatSupported(rawFile);
        formData.set('avatar', convertedFile);
    }

    const headers = getRequestHeaders({ omitContentType: true });

    if ($('#form_create').attr('actiontype') == 'createcharacter') {
        if (String($('#character_name_pole').val()).length === 0) {
            $('#character_name_pole').attr('aria-invalid', 'true').trigger('focus');
            toastr.error(t`Name is required`);
            return;
        }
        if (is_group_generating || is_send_press) {
            toastr.error(t`Cannot create characters while generating. Stop the request and try again.`, t`Creation aborted`);
            return;
        }
        try {
            //if the character name text area isn't empty (only posible when creating a new character)
            let url = '/api/characters/create';

            if (crop_data != undefined) {
                url += `?crop=${encodeURIComponent(JSON.stringify(crop_data))}`;
            }

            formData.delete('alternate_greetings');
            for (const value of create_save.alternate_greetings) {
                formData.append('alternate_greetings', value);
            }

            formData.append('extensions', JSON.stringify(create_save.extensions));

            const fetchResult = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
                cache: 'no-cache',
            });

            if (!fetchResult.ok) {
                throw new Error('Fetch result is not ok');
            }

            const createWarnings = String(fetchResult.headers.get('x-tauritavern-warning') || '')
                .split(',')
                .map(warning => warning.trim())
                .filter(Boolean);
            const avatarId = await fetchResult.text();

            setCharacterPopupOpen(false);
            const fields = [
                { id: '#character_name_pole', callback: value => create_save.name = value },
                { id: '#description_textarea', callback: value => create_save.description = value },
                { id: '#creator_notes_textarea', callback: value => create_save.creator_notes = value },
                { id: '#character_version_textarea', callback: value => create_save.character_version = value },
                { id: '#post_history_instructions_textarea', callback: value => create_save.post_history_instructions = value },
                { id: '#system_prompt_textarea', callback: value => create_save.system_prompt = value },
                { id: '#tags_textarea', callback: value => create_save.tags = value },
                { id: '#creator_textarea', callback: value => create_save.creator = value },
                { id: '#personality_textarea', callback: value => create_save.personality = value },
                { id: '#firstmessage_textarea', callback: value => create_save.first_message = value },
                { id: '#talkativeness_slider', callback: value => create_save.talkativeness = value, defaultValue: talkativeness_default },
                { id: '#scenario_pole', callback: value => create_save.scenario = value },
                { id: '#depth_prompt_prompt', callback: value => create_save.depth_prompt_prompt = value },
                { id: '#depth_prompt_depth', callback: value => create_save.depth_prompt_depth = value, defaultValue: depth_prompt_depth_default },
                { id: '#depth_prompt_role', callback: value => create_save.depth_prompt_role = value, defaultValue: depth_prompt_role_default },
                { id: '#mes_example_textarea', callback: value => create_save.mes_example = value },
                { id: '#character_json_data', callback: () => { } },
                { id: '#alternate_greetings_template', callback: value => create_save.alternate_greetings = value, defaultValue: [] },
                { id: '#character_world', callback: value => create_save.world = value },
                { id: '#_character_extensions_fake', callback: value => create_save.extensions = {} },
            ];

            fields.forEach(field => {
                const fieldValue = field.defaultValue !== undefined ? field.defaultValue : '';
                $(field.id).val(fieldValue);
                field.callback && field.callback(fieldValue);
            });

            if (Array.isArray(create_save.extra_books) && create_save.extra_books.length > 0) {
                const fileName = getCharaFilename(null, { manualAvatarKey: avatarId });
                const charLore = world_info.charLore ?? [];
                charLore.push({ name: fileName, extraBooks: create_save.extra_books });
                Object.assign(world_info, { charLore: charLore });
                saveSettingsDebounced();
            }
            create_save.extra_books = [];

            $('#character_popup-button-h3').text('Create character');

            create_save.avatar = null;

            $('#add_avatar_button').replaceWith(
                $('#add_avatar_button').val('').clone(true),
            );

            let oldSelectedChar = null;
            if (this_chid !== undefined) {
                oldSelectedChar = characters[this_chid].avatar;
            }

            console.log(`new avatar id: ${avatarId}`);
            if (createWarnings.includes('avatar-import-failed')) {
                toastr.warning(t`Character created, but avatar import had a recoverable issue. Check the avatar and re-upload if needed.`);
            }
            createTagMapFromList('#tagList', avatarId);
            await getCharacters();

            select_rm_info('char_create', avatarId, oldSelectedChar);

            crop_data = undefined;
        } catch (error) {
            console.error('Error creating character', error);
            toastr.error(t`Failed to create character`);
        }
    } else {
        try {
            let url = '/api/characters/edit';

            if (crop_data != undefined) {
                url += `?crop=${encodeURIComponent(JSON.stringify(crop_data))}`;
            }

            formData.delete('alternate_greetings');
            const chid = $('.open_alternate_greetings').data('chid');
            if (characters[chid] && Array.isArray(characters[chid]?.data?.alternate_greetings)) {
                for (const value of characters[chid].data.alternate_greetings) {
                    formData.append('alternate_greetings', value);
                }
            }

            const fetchResult = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
                cache: 'no-cache',
            });

            if (!fetchResult.ok) {
                throw new Error('Fetch result is not ok');
            }

            await getOneCharacter(formData.get('avatar_url'));
            favsToHotswap(); // Update fav state

            $('#add_avatar_button').replaceWith(
                $('#add_avatar_button').val('').clone(true),
            );
            $('#create_button').attr('value', 'Save');
            crop_data = undefined;
            await eventSource.emit(event_types.CHARACTER_EDITED, { detail: { id: this_chid, character: characters[this_chid] } });

            // Recreate the chat if it hasn't been used at least once (i.e. with continue).
            const message = getFirstMessage();
            const shouldRegenerateMessage =
                !isNewChat &&
                message.mes &&
                !selected_group &&
                !chat_metadata.tainted &&
                (chat.length === 0 || (chat.length === 1 && !chat[0].is_user && !chat[0].is_system));

            if (shouldRegenerateMessage) {
                let messageId;
                await withChatSurfaceStructureMutation(async () => {
                    replaceChatContents([message]);
                    messageId = (chat.length - 1);
                    await eventSource.emit(event_types.MESSAGE_RECEIVED, messageId, 'first_message');
                    await clearChat();
                    await printMessages();
                });
                await finalizeMessageContent(messageId, event_types.CHARACTER_MESSAGE_RENDERED, 'first_message');
                await saveChatConditional();
            }
        } catch (error) {
            console.log(error);
            toastr.error(t`Something went wrong while saving the character, or the image file provided was in an invalid format. Double check that the image is not a webp.`);
        }
    }
}

function formatSwipeCounter(current, total) {
    if (isNaN(current) && isNaN(total)) {
        return '';
    }
    return `${!isNaN(current) ? current : '?'}\u200b/\u200b${!isNaN(total) ? total : '?'}`;
}

export async function swipe(event, direction, { source, repeated, message = chat[chat.length - 1], forceMesId, forceSwipeId, forceDuration } = {}) {
    if (chat.length === 0) {
        console.warn('Swipe was called on an empty chat.');
        return;
    }

    let messageIndex;

    //Only set messageIndex if message exists because -1 is truthy.
    if (message) {
        messageIndex = chat.indexOf(message);
        if (messageIndex === -1 && typeof (forceMesId) != 'number') {
            console.error(`The message must exist in chat. ${message};`);
            return;
        }
    }

    const mesId = Number(forceMesId ?? event?.currentTarget?.closest('.mes')?.getAttribute('mesid') ?? messageIndex ?? chat.length - 1);

    if ([SWIPE_SOURCE.DELETE, SWIPE_SOURCE.BACK, SWIPE_SOURCE.AUTO_SWIPE, SWIPE_SOURCE.SLASH_COMMAND, SWIPE_SOURCE.SWIPE_PICKER].includes(source)) {
        console.info(`The ${direction} swipe source on message #${mesId} is ${source}, Most checks have been bypassed. `);
    } else {
        //Only show an error if swipes are not hidden and a message is generating.
        if (isGenerating() && (swipes && !swipesHidden && (swipeState === SWIPE_STATE.NONE))) {
            toastr.warning(t`Cannot swipe while generating. Stop the request and try again.`, t`Swipe aborted`);
            return;
        }
        //Only allow one concurrent swipe.
        if (!isSwipingAllowed()) {
            console.info('The swipe has been ignored messages cannot currently be swiped.');
            return;
        }
        if (!isMessageSwipeable(mesId, message)) {
            console.info(`Message #${mesId} cannot be swiped. ${message}`);
            return;
        }
    }

    const thisMesDiv = chatElement.children('.mes').filter(`[mesid="${mesId}"]`);
    const thisMesText = thisMesDiv.find('.mes_block .mes_text');
    const thisMesDivHeight = thisMesDiv[0]?.scrollHeight;
    const thisMesTextHeight = thisMesText[0]?.scrollHeight;
    if (![thisMesDiv.length, thisMesText.length].every(num => num > 0)) {
        console.error(`Message #${mesId}'s DOM element is not valid.`);
        return;
    }

    // Cancel pending save to prevent accidental swipe_id overwrites.
    cancelDebouncedChatSave();

    let generation;
    const originalSwipeId = Number(chat[mesId]?.swipe_id ?? 0);
    let newSwipeId = Number(forceSwipeId ?? originalSwipeId);

    /**
     * Calculates the next swipe duration with how many swipes have been repeated.
     * @param {number} animation_duration
     * @returns {number} The adjusted swipe duration.
     */
    function getSwipeDuration(animation_duration) {
        const now = performance.now();
        const resetTime = animation_duration * 2 + 300;

        //Reset the counter if the last swipe was more than half a second ago.
        if (now - lastSwipeInfo.now >= resetTime || direction !== lastSwipeInfo.direction) recentSwipes = 0;
        recentSwipes++;
        lastSwipeInfo = { now, direction };

        //At 4 swipes, animation_duration will be halved.
        const sigmoid = 1 / (1 + Math.exp(recentSwipes - 4));

        return animation_duration * sigmoid;
    }

    const swipeDuration = forceDuration ?? getSwipeDuration(animation_duration);

    //The offscreen messages may be visible if the user resizes the viewport during a swipe.
    const thisMesDivWidth = thisMesDiv.width() + 30;
    let swipeRange = (direction === SWIPE_DIRECTION.RIGHT) ? -thisMesDivWidth : thisMesDivWidth;

    /**
     * Waits for the generation to end, reverts the swipe if swipe_id has not changed.
     * @param {boolean} revert Attept to revert the swipe without saving.
     */
    async function endSwipe(revert = false) {
        //Wait for the generation to end.
        try {
            //`mes_buttons` need to be hidden until the animation completes.
            if (generation) {
                document.body.dataset.swiping = 'true';
                await generation;
            }
        } catch (error) {
            console.warn(`Swipe failed, Swiping back. ${error}`);
        }

        //Clamp Id between swipes.
        let clampedId = clamp(chat[mesId].swipe_id, 0, Math.max(0, chat[mesId].swipes.length - 1));

        await updateSwipeCounter(mesId);
        //Fallback.
        if (mesId !== chat.length - 1) {
            await updateSwipeCounter(chat.length - 1);
        }

        // If swipe_id has not changed, give the user feedback.
        if (clampedId == originalSwipeId && source != SWIPE_SOURCE.DELETE) {
            try {
                //Shake 700/140=5px
                shakeElement(thisMesDiv, -swipeRange / 140, animation_duration, 'ease-in');
                //Flash red.
                const flashTime = Math.max(animation_duration * 2, 100);
                await Promise.race([thisMesDiv.find('.swipes-counter').animate({ color: 'red' }, flashTime).animate({ color: '' }).promise(), createTimeout(flashTime * 4, `The shake animation did not end within ${flashTime * 4}ms`)].filter(Boolean));
            } catch (error) {
                console.warn(error);
            }
        }

        //If the id is not within bounds, Swipe back.
        if (chat[mesId]?.swipe_id !== clampedId || revert) {
            // Prevent recursion.
            if (source != SWIPE_SOURCE.BACK) {
                source = SWIPE_SOURCE.BACK;
                chat[mesId].swipe_id = clampedId;

                //Update the chat.
                await loadFromSwipeId(mesId, chat[mesId].swipe_id);
                await redisplayChat({ startIndex: mesId });
            } else {
                await Popup.show.confirm(
                    t`ERROR: <code>syncSwipeToMes</code> has failed to revert the failed ${direction} swipe on message #${mesId}.`,
                    t`<p>After you click OK, the chat will be reloaded to prevent data corruption.</p>`,
                    { okButton: 'OK', cancelButton: false },
                );
                console.trace(`Error! Recursion detected when reverting failed ${direction} swipe on message #${mesId}. Something has broken.`);
                await reloadCurrentChat();
            }
            //Out of bounds swipes should not be saved.
        } else if (source != SWIPE_SOURCE.BACK) {
            //Save the chat if swipe_id has changed.
            saveChatDebounced();
        }

    }

    async function standardSwipe(newSwipeId) {
        //If swipe_id has changed, or the source is being deleted.
        if (newSwipeId !== originalSwipeId || source == SWIPE_SOURCE.DELETE || source == SWIPE_SOURCE.BACK) {
            //Update the chat.
            await loadFromSwipeId(mesId, newSwipeId);
            //Transition to the new chat.
            await animateSwipe();
        }
        await endSwipe();
    }

    /**
     * Removes a message's extra and gen times.
     * @param {ChatMessage} message
     */
    function clearMessageData(message) {
        if (message.extra && typeof message.extra === 'object') {
            delete message.extra.memory;
            delete message.extra.display_text;
            delete message.extra.media;
            delete message.extra.inline_image;
            delete message.extra.files;
            delete message.extra.fileLength;
            delete message.extra.generationType;
            delete message.extra.negative;
            delete message.extra.title;
            delete message.extra.append_title;
        }
        delete message.gen_started;
        delete message.gen_finished;
    }

    /**
     * Sets the message to the newSwipeId and loads it.
     * @param {number} mesId
     * @param {number} newSwipeId
     */
    async function loadFromSwipeId(mesId, newSwipeId) {
        //Update the swipe_id.
        chat[mesId].swipe_id = newSwipeId;

        clearMessageData(chat[mesId]);

        //Load from swipes.
        if (syncSwipeToMes(mesId, newSwipeId) == false) {
            let errorMessage = t`When swiping ${direction} on message ${mesId}, syncSwipeToMes has returned false. Attempting to swipe back!`;
            toastr.error(errorMessage);

            chat[mesId].swipe_id = originalSwipeId;
            await endSwipe(true);
        }
        return true;
    }

    /**
     * Animates a swipe for all messages >= mesId.
     * @param {number} mesId
     * @param {object} params
     * @param {string} [params.xStart='opx']
     * @param {string} [params.xEnd='0px']
     * @param {number} [params.duration=animation_duration]
     * @param {string} [params.classes=''] Additional CSS classes to target during the swipe.
     * @param {boolean} [params.freeze=true] When true, do not remove the class from the animation, leaving it stuck at xEnd.
     * @returns {Promise<boolean|Function>} endSlide unfreezes the messages from xEnd.
     */
    async function animateSwipeTransition(mesId, { xStart = '0px', xEnd = '0px', duration = animation_duration, classes = '', freeze = false } = {}) {
        // If the animation_duration is zero, the 'animationend' promise will never resolve.
        //Skip the animation if it's faster than 50ms.
        if (duration <= 50) return;

        //Select MAXIMUM_ANIMATED messages after mesId. Ideally, only visible messages would be animated.
        const MAXIMUM_ANIMATED = 100;

        const messages = chatElement.children('.mes');
        const swipedMessagesDiv = messages.filter((_index, div) => {
            const divMessageId = Number(div.getAttribute('mesid'));

            return (divMessageId < mesId + MAXIMUM_ANIMATED && divMessageId >= mesId);
        });
        if (swipedMessagesDiv.length > 0) {
            let swipeClasses = '.mes_block, .mesAvatarWrapper';
            swipeClasses += classes;

            //Select only the target classes.
            const swipedElementsDiv = swipedMessagesDiv.children(swipeClasses);
            if (swipedElementsDiv.length > 0) {
                //This is a global variable, only one swipe transition can occur concurrently.
                document.documentElement.style.setProperty('--slide-mes-x-start', xStart);
                document.documentElement.style.setProperty('--slide-mes-x-end', xEnd);
                document.documentElement.style.setProperty('--slide-mes-x-duration', `${duration}ms`);

                //The class must be removed to unfreze previous slides.
                swipedElementsDiv.removeClass('slide');
                //CSS starts the animation.
                void swipedElementsDiv[0].offsetWidth;
                swipedElementsDiv.addClass('slide');

                const endSlide = () => {
                    //Remove the style when done.
                    swipedElementsDiv.removeClass('slide');

                    document.documentElement.style.setProperty('--slide-mes-x-start', '');
                    document.documentElement.style.setProperty('--slide-mes-x-end', '');
                    document.documentElement.style.setProperty('--slide-mes-duration', '');
                    return true;
                };
                //Wait for the animation's end. https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished
                const animations = swipedElementsDiv[0]?.getAnimations() ?? [];
                const animation = animations.filter((a) => a instanceof globalThis.CSSAnimation && a.animationName == 'slide')[0];
                try {
                    await Promise.race([animation?.finished, createTimeout(duration * 2, `The ${duration}ms swipe animation has not ended after ${duration * 2}ms. It has been skipped.`)].filter(Boolean));
                } catch (error) {
                    console.warn(error);
                }

                //If not frozen, end the slide now.
                return freeze ? endSlide : endSlide();
            }
        }
        console.warn(`No animatable messages were found after message #${mesId}.`);
        return false;
    }

    function getMessageBottomHeight(thisMesDiv) {
        const thisMesRect = thisMesDiv[0].getBoundingClientRect();
        //Scroll position + Chat height = Bottom of chat height.
        const chatBottom = getChatScrollTop() - chatElement.height();
        //Message offset from viewport top + height = Bottom of message offset.
        const messageBottom = thisMesRect.top + thisMesDiv.height();
        // Bottom of chat + Bottom of message offset = target scroll position.
        const scrollHeight = (chatBottom + messageBottom);
        return scrollHeight;
    }

    function expandNewMessage(thisMesDiv) {
        //Only scroll if the view is not near the bottom.
        const is_animation_scroll = (getChatScrollTop() >= (getChatScrollHeight() - chatElement.outerHeight()) - 10);

        let new_height = thisMesDivHeight - (thisMesTextHeight - thisMesText[0].scrollHeight);
        if (new_height < 103) new_height = 103;

        //Keep the swipe buttons at the same height when scrolling is finished.

        //Expand new message.
        thisMesDiv.animate({ height: new_height + 'px' }, {
            duration: 0, //used to be 100 //Disabled on Cohee's request. https://github.com/SillyTavern/SillyTavern/pull/4610/files#r2408731744
            queue: false,
            progress: function (animation, progress, remainingMs) {
                if (is_animation_scroll) setChatScrollTop(getMessageBottomHeight(thisMesDiv));
            },
            complete: function () {
                thisMesDiv.css('height', 'auto');
                //Correct height auto offset.
                if (is_animation_scroll) setChatScrollTop(getMessageBottomHeight(thisMesDiv));
            },
        });
    }

    /**
     * Anime a swipe, optionally running a generation.
     * @param {boolean} run_generate
     * @param {boolean} [skipSwipeOut=false]
     */
    async function animateSwipe(run_generate = false, skipSwipeOut = false) {
        if (!skipSwipeOut) {
            //Swipe out.
            await animateSwipeTransition(mesId, { xEnd: `${swipeRange}px`, duration: swipeDuration });
        }


        if (run_generate) {
            await updateSwipeCounter(mesId);
            //shows "..." while generating
            replaceTransientMesTextHtmlWithRuntimePolicy(
                /** @type {HTMLElement} */ (thisMesDiv[0]),
                '...',
            );
            // resets the timer
            thisMesDiv.find('.mes_timer').html('');
            thisMesDiv.find('.tokenCounterDisplay').text('');
            thisMesDiv.find('.mes_generation_info').empty();
            updateReasoningUI(thisMesDiv, { reset: true });
        } else {
            //console.log('showing previously generated swipe candidate, or "..."');
            //console.log('onclick right swipe calling addOneMessage');

            //Only scroll when swiping the last message.
            const scroll = (mesId == chat.length - 1);
            //The swipe buttons will be refreshed in endSwipe(), refreshing them now will cause flickering.
            addOneMessage(chat[mesId], { type: 'swipe', forceId: mesId, scroll: scroll, showSwipes: false });
            await finalizeMessageContent(mesId);

            if (shouldCountMessageTokens()) {
                if (!chat[mesId].extra) {
                    chat[mesId].extra = {};
                }

                const tokenCountText = (chat[mesId]?.extra?.reasoning || '') + chat[mesId].mes;
                const tokenCount = await getTokenCountAsync(tokenCountText, 0);
                chat[mesId].extra.token_count = tokenCount;
                thisMesDiv.find('.tokenCounterDisplay').text(`${tokenCount}t`);
                const { tokenRate } = formatGenerationTimer(chat[mesId].gen_started, chat[mesId].gen_finished, tokenCount);
                updateMessageGenerationInfo(thisMesDiv[0], chat[mesId], tokenRate);
            }
        }

        //Animate expanding to the new message height.
        thisMesDiv.css('height', thisMesDivHeight);
        expandNewMessage(thisMesDiv);

        if (run_generate) {
            appendMediaToMessage(chat[mesId], thisMesDiv);
        }

        await eventSource.emit(event_types.MESSAGE_SWIPED, (mesId));

        if (run_generate && !is_send_press) {
            generation = (async () => {
                const agentOptions = await getAgentGenerationOptions({
                    generationType: 'swipe',
                    mainApi: main_api,
                    selectedGroup: selected_group,
                });
                is_send_press = true;
                return Generate('swipe', agentOptions);
            })();
        }

        //Swipe in from the opposite side.
        await animateSwipeTransition(mesId, { xStart: `${-swipeRange}px`, xEnd: `${0}px`, duration: swipeDuration });
    }

    swipeState = SWIPE_STATE.SWIPING;
    try {
        if (!await hydrateChatMessageSwipes(mesId)) return;
        if (mesId === Number(this_edit_mes_id)) {
            closeMessageEditor();
        }
        if (isStreamingEnabled() && streamingProcessor) {
            streamingProcessor.onStopStreaming();
        }

        if (isHordeGenerationNotAllowed()) {
            return unblockGeneration();
        }

        //If the swipe is not being deleted.
        if (source != SWIPE_SOURCE.DELETE && source != SWIPE_SOURCE.BACK) {
            // Make sure ad-hoc changes to extras are saved before swiping away
            syncMesToSwipe(mesId);

            if (chat[mesId].swipe_id === undefined) {              // if there is no swipe-message in the last spot of the chat array
                chat[mesId].swipe_id = 0;                        // set it to id 0
                chat[mesId].swipes = [];                         // empty the array
                chat[mesId].swipe_info = [];
                chat[mesId].swipes[0] = chat[mesId].mes;  //assign swipe array with last chat[mesId] from chat
                chat[mesId].swipe_info[0] = {
                    'send_date': chat[mesId].send_date,
                    'gen_started': chat[mesId].gen_started,
                    'gen_finished': chat[mesId].gen_finished,
                    'extra': structuredClone(chat[mesId].extra),
                };
            }
            // If the user is holding down the key and we're at the last or first swipe, don't do anything.
            let isLastSwipe = (direction === SWIPE_DIRECTION.RIGHT) ? (chat[mesId].swipe_id === Math.max(0, chat[mesId].swipes.length - 1)) : chat[mesId].swipe_id === 0;
            if (source === SWIPE_SOURCE.KEYBOARD && repeated && isLastSwipe) {
                await endSwipe();
                return;
            }
        } else if (source == SWIPE_SOURCE.DELETE || source == SWIPE_SOURCE.BACK) {
            //If the swipe is being deleted or reverted.
            await standardSwipe(newSwipeId);
            return;
        }

        //If swiping left.
        if (direction === SWIPE_DIRECTION.LEFT) {
            if (forceSwipeId == null) newSwipeId--;
            //Loop to last swipe if negative.
            if (newSwipeId < 0) {
                newSwipeId = Math.max(0, chat[mesId].swipes.length - 1);
            }
            //Limit swipe_id to swipes.
            if (newSwipeId > chat[mesId].swipes.length - 1) {
                toastr.warning(`The swipe_id for message #${mesId} was ${newSwipeId}. It has been reset to ${chat[mesId].swipes.length - 1}.`);
                chat[mesId].swipe_id = chat[mesId].swipes.length - 1;
                await endSwipe();
                return;
            }
            await standardSwipe(newSwipeId);
            return;
        } else if (direction === SWIPE_DIRECTION.RIGHT) {
            //If swiping right.
            // make new slot in array
            if (forceSwipeId == null) newSwipeId++;

            //Minimum of zero.
            if (newSwipeId < 0) {
                toastr.warning(`The swipe_id for message #${mesId} was ${newSwipeId}. It has been reset to zero.`);
                chat[mesId].swipe_id = 0;
                await endSwipe();
                return;
            }

            //If overswiping.
            if (newSwipeId >= chat[mesId].swipes.length) {
                newSwipeId = chat[mesId].swipes.length;

                //Update the swipe_id.
                chat[mesId].swipe_id = newSwipeId;

                const overswipe = getOverswipeBehavior(mesId);

                //Cancel the generation.
                if (overswipe == OVERSWIPE_BEHAVIOR.NONE) {
                    //Cancel swipe.
                    chat[mesId].swipe_id = originalSwipeId;
                    await endSwipe();
                    return;
                } else if (overswipe == OVERSWIPE_BEHAVIOR.REGENERATE) {
                    //Regenerate the message
                    clearMessageData(chat[mesId]);
                    let run_generate = true;
                    //Generate.
                    await animateSwipe(run_generate);
                    await endSwipe();
                    return;
                } else if (overswipe == OVERSWIPE_BEHAVIOR.LOOP || overswipe == OVERSWIPE_BEHAVIOR.PRISTINE_GREETING) {
                    // Loop to the first swipe.
                    newSwipeId = 0;
                }
            }
            await standardSwipe(newSwipeId);
            return;
        }
    } finally {
        swipeState = SWIPE_STATE.NONE;
        delete document.body.dataset.swiping;
        showSwipeButtons();
    }
}

export async function swipe_left(event, { source, repeated, message } = {}) {
    await swipe.call(this, event, SWIPE_DIRECTION.LEFT, { source: source, repeated: repeated, message: message });
}

export async function swipe_right(event = null, { source, repeated, message } = {}) {
    await swipe.call(this, event, SWIPE_DIRECTION.RIGHT, { source: source, repeated: repeated, message: message });
}

export async function processDroppedFiles(files, data = new Map(), { replacement = false } = {}) {
    if (is_group_generating || is_send_press) {
        toastr.error(t`Cannot import characters while generating. Stop the request and try again.`, t`Import aborted`);
        throw new Error('Cannot import character while generating');
    }
    try {
        await flushWorldInfoSaves('import_character_lorebook');
    } catch (error) {
        toastr.error(error?.message, t`Import aborted`);
        throw error;
    }

    const avatarFileNames = [];
    pauseImportedCharacterAgentAssetQueue();
    try {
        for (const file of files) {
            const preservedName = data instanceof Map && data.get(file);
            const imported = await importCharacter(file, { preserveFileName: preservedName, replacement });
            if (imported) {
                avatarFileNames.push(imported.avatarFileName);
                try {
                    await completeCharacterLorebookAdoption(imported.avatarFileName, imported.lorebook, { notify: imported.replaced });
                } catch (error) {
                    console.warn('Character imported, but its lorebook adoption could not be completed:', error);
                    toastr.warning(error?.message, t`Character imported; lorebook import failed`);
                }
            }
        }

        if (avatarFileNames.length > 0) {
            try {
                await importCharactersTags(avatarFileNames);
            } catch (error) {
                console.warn('Characters imported, but their tags could not be imported:', error);
                toastr.warning(error?.message, t`Characters imported; tag import failed`);
            }
        }

        if (avatarFileNames.length > 0) {
            try {
                selectImportedChar(avatarFileNames[avatarFileNames.length - 1]);
            } catch (error) {
                console.warn('Characters imported, but the imported character could not be selected:', error);
                toastr.warning(error?.message, t`Characters imported; selection failed`);
            }
        }
    } finally {
        resumeImportedCharacterAgentAssetQueue();
    }
}

async function importCharactersTags(avatarFileNames) {
    await getCharacters();
    for (let i = 0; i < avatarFileNames.length; i++) {
        if (power_user.tag_import_setting !== tag_import_setting.NONE) {
            const importedCharacter = characters.find(character => character.avatar === avatarFileNames[i]);
            await importTags(importedCharacter);
        }
    }
}

function selectImportedChar(charId) {
    let oldSelectedChar = null;
    if (this_chid !== undefined) {
        oldSelectedChar = characters[this_chid].avatar;
    }
    select_rm_info('char_import_no_toast', charId, oldSelectedChar);
}

async function importCharacter(file, { preserveFileName = '', replacement = false } = {}) {
    const ext = (file instanceof StagedFile ? file.path : file.name).match(/\.(\w+)$/);
    if (!ext || !(['json', 'png', 'yaml', 'yml', 'charx', 'byaf'].includes(ext[1].toLowerCase()))) {
        if (replacement) {
            throw new Error(t`Unsupported file type: ` + file.name);
        }
        toastr.warning(t`Unsupported file type: ` + file.name);
        return;
    }

    const format = ext[1].toLowerCase();
    $('#character_import_file_type').val(format);
    const formData = new FormData();
    if (file instanceof StagedFile) {
        formData.append('staged_path', file.path);
    } else {
        formData.append('avatar', file);
    }
    formData.append('file_type', format);
    formData.append('user_name', name1);
    if (preserveFileName) formData.append('preserved_name', preserveFileName);

    try {
        const result = await fetch('/api/characters/import', {
            method: 'POST',
            body: formData,
            headers: getRequestHeaders({ omitContentType: true }),
            cache: 'no-cache',
        });

        if (!result.ok) {
            let details = '';

            try {
                const payload = await result.clone().json();
                details = String(payload?.error || '').trim();
            } catch {
                try {
                    details = String(await result.text()).trim();
                } catch {
                    // noop
                }
            }

            const fallback = result.statusText || `HTTP ${result.status}`;
            const reason = details || fallback;
            throw new Error(`Failed to import character: ${reason}`);
        }

        const data = await result.json();

        if (data.error) {
            throw new Error(`Server returned an error: ${data.error}`);
        }

        if (data.file_name !== undefined) {
            const avatarFileName = `${data.file_name}.png`;
            const replaced = Boolean(data.replaced);

            $('#character_search_bar').val('').trigger('input');

            if (replaced) {
                toastr.success(t`Character Replaced: ${String(data.file_name).replace('.png', '')}`);
            } else {
                toastr.success(t`Character Created: ${String(data.file_name).replace('.png', '')}`);
            }
            try {
                enqueueImportedCharacterAgentAssetScan({
                    avatarFileName,
                    label: String(data.file_name).replace('.png', ''),
                    character: data.character,
                    postImport: data.post_import,
                });
            } catch (error) {
                console.warn('Character imported, but its Agent assets could not be inspected:', error);
                toastr.warning(error?.message, t`Character imported; Agent asset scan failed`);
            }
            return { avatarFileName, replaced, lorebook: data.lorebook };
        }

        if (replacement) {
            throw new Error(t`Failed to replace the character card.`);
        }
    } catch (error) {
        console.error('Error importing character', error);
        if (replacement) {
            throw error;
        }

        const message = error?.message || t`The file is likely invalid or corrupted.`;
        toastr.error(message, t`Could not import character`);
    }
}

export async function doNewChat({ deleteCurrentChat = false } = {}) {
    //Make a new chat for selected character
    if ((!selected_group && this_chid == undefined) || menu_type == 'create') {
        return;
    }

    if (!deleteCurrentChat) {
        await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
    }
    const oldChat = getCurrentChatDetails()?.sessionName;
    const groupId = selected_group;
    const avatar = characters[this_chid]?.avatar;

    if (deleteCurrentChat) {
        await prepareCurrentChatFileChange({ saveEdits: true });
    }
    await clearChat({ clearData: true });

    if (selected_group) {
        await createNewGroupChat(selected_group);
    } else {
        //RossAscends: added character name to new chat filenames and replaced Date.now() with humanizedDateTime;
        chat_metadata = {};
        characters[this_chid].chat = `${name2} - ${humanizedDateTime()}`;
        $('#selected_chat_pole').val(characters[this_chid].chat);
        await getChat({ allowNewChat: true });
        await createOrEditCharacter(new CustomEvent('newChat'));
    }
    focusChatInput(ChatInputFocusIntent.NAVIGATION);
    if (deleteCurrentChat) {
        await (groupId ? deleteGroupChat(groupId, oldChat) : deleteCharacterChat(avatar, oldChat)).catch(error => {
            console.error('Chat created, but the previous chat could not be deleted:', error);
            toastr.warning(error.message, t`Chat created, but the previous chat could not be deleted.`);
        });
    }
}

export function confirmChatDelete(fileName) {
    return Popup.show.confirm(t`Delete the Chat File?`, `<p>${escapeHtml(fileName)}</p>`, {
        label: `${t`Delete the Chat File?`}: ${fileName}`,
    });
}

export async function promptChatRename(fileName) {
    const content = document.createElement('div');
    content.innerHTML = await renderTemplateAsync('chatRename');
    const name = await callGenericPopup(content, POPUP_TYPE.INPUT, fileName, {
        label: `${t`Rename Chat`}: ${fileName}`,
        inputLabel: content.querySelector('h3'),
    });
    return typeof name === 'string' && name.trim() && name !== fileName ? name : undefined;
}

export async function renameGroupOrCharacterChat({ characterId, groupId, oldFileName, newFileName, loader: showLoader }) {
    const avatar = characters[characterId]?.avatar;
    const body = {
        is_group: !!groupId,
        avatar_url: avatar,
        original_file: `${oldFileName}.jsonl`,
        renamed_file: `${newFileName.trim()}.jsonl`,
    };

    if (body.original_file === body.renamed_file) {
        console.debug('Chat rename cancelled, old and new names are the same');
        return undefined;
    }
    if (equalsIgnoreCaseAndAccents(body.original_file, body.renamed_file)) {
        toastr.warning(t`Name not accepted, as it is the same as before (ignoring case and accents).`, t`Rename Chat`);
        return undefined;
    }

    const loaderHandle = showLoader ? loader.show({
        slug: 'chat-rename',
        title: t`Rename Chat`,
        message: t`Renaming chat…`,
        toastMode: loader.ToastMode.STATIC,
    }) : null;

    try {
        if (!groupId && !avatar) throw new Error(`Character not found: ${characterId}`);
        if (isChatOpen({ avatar, groupId }, oldFileName)) {
            await prepareCurrentChatFileChange({ saveEdits: true });
        }
        const response = await fetch('/api/chats/rename', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: getRequestHeaders(),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.details || (typeof data.error === 'string' ? data.error : 'Server returned an error.'));
        }

        if (typeof data.sanitizedFileName !== 'string' || !data.sanitizedFileName) {
            throw new Error('Server did not return renamed chat file name.');
        }

        const committedFileName = data.sanitizedFileName;
        const wasOpen = isChatOpen({ avatar, groupId }, oldFileName);

        const renamedCharacterId = characters.findIndex(character => character.avatar === avatar);
        if (groupId) {
            await renameGroupChat(groupId, oldFileName, committedFileName);
        } else if (characters[renamedCharacterId]?.chat === oldFileName) {
            if (wasOpen) $('#selected_chat_pole').val(committedFileName);
            await updateRemoteChatName(renamedCharacterId, committedFileName).catch(error => {
                console.error('Chat renamed, but its current-chat record could not be saved:', error);
                toastr.warning(error.message, t`Chat renamed, but the character's current chat could not be saved.`);
            });
        }

        if (wasOpen && isChatOpen({ avatar, groupId }, committedFileName)) {
            await reloadCurrentChat().catch(error => {
                console.error('Chat renamed, but it could not be reloaded:', error);
                toastr.warning(error.message, t`Chat renamed, but the current chat could not be reloaded.`);
            });
        }

        const eventData = { avatarId: body.avatar_url, groupId, oldFileName: body.original_file, newFileName: `${committedFileName}.jsonl` };
        await eventSource.emit(event_types.CHAT_RENAMED, eventData);
        return committedFileName;
    } catch (error) {
        console.error('Failed to rename chat:', error);
        toastr.error(error.message, t`Chat could not be renamed.`);
        return undefined;
    } finally {
        await loaderHandle?.hide();
    }
}

export async function renameChat(oldFileName, newName) {
    return await renameGroupOrCharacterChat({
        characterId: this_chid,
        groupId: selected_group,
        oldFileName: oldFileName,
        newFileName: newName,
        loader: true,
    });
}

export async function closeCurrentChat() {
    if (is_send_press == false) {
        await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
        await clearChat({ clearData: true });
        resetSelectedGroup();
        setCharacterId(undefined);
        setCharacterName('');
        setActiveCharacter(null);
        setActiveGroup(null);
        this_edit_mes_id = undefined;
        chat_metadata = {};
        selected_button = 'characters';
        setSelectedCharacterName('');
        select_rm_characters();
        await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
        return true;
    } else {
        toastr.info(t`Please stop the message generation first.`);
        return false;
    }
}

export async function updateRemoteChatName(characterId, newName) {
    const character = characters[characterId];
    if (!character) throw new Error(`Character not found: ${characterId}`);
    character.chat = newName;
    const mergeRequest = {
        avatar: character.avatar,
        chat: newName,
    };
    const mergeResponse = await fetch('/api/characters/merge-attributes', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(mergeRequest),
    });
    if (!mergeResponse.ok) {
        throw new Error(`Could not save the current chat for "${character.name}": ${mergeResponse.status} ${mergeResponse.statusText}`);
    }
}

export async function deleteCharacter(characterKey, { deleteChats = true } = {}) {
    if (!Array.isArray(characterKey)) {
        characterKey = [characterKey];
    }

    const inTempChat = this_chid === undefined && name2 === neutralCharacterName;
    if (inTempChat) {
        const confirmClose = await Popup.show.confirm(
            t`You are currently in a temporary chat.`,
            t`Deleting this character will close the chat and you will lose any unsaved messages. Do you want to proceed?`,
        );
        if (!confirmClose) {
            return false;
        }
    }

    const closeChatResult = await closeCurrentChat();
    if (!closeChatResult) {
        return false;
    }

    const deletedAvatars = new Set();
    const candidateLorebooks = new Set();

    for (const key of characterKey) {
        const character = characters.find(x => x.avatar == key);
        if (!character) {
            toastr.warning(t`Character ${key} not found. Skipping deletion.`);
            continue;
        }
        const world = character.data?.extensions?.world;

        const chid = characters.indexOf(character);
        const pastChats = deleteChats
            ? await getPastCharacterChats(chid).catch(error => {
                console.error('Failed to list chats before deleting character:', error);
                return [];
            })
            : [];

        const msg = { avatar_url: character.avatar, delete_chats: deleteChats };

        const response = await fetch('/api/characters/delete', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify(msg),
            cache: 'no-cache',
        });

        if (!response.ok) {
            toastr.error(`${response.status} ${response.statusText}`, t`Failed to delete character`);
            continue;
        }
        deletedAvatars.add(character.avatar);
        // Only strings identify lorebooks; card extensions preserve other JSON types.
        if (typeof world === 'string' && world) candidateLorebooks.add(world);

        try {
            const { clearCharacterSkillImportReminders } = await import('./scripts/tauri/agent-skills/reminders.js');
            clearCharacterSkillImportReminders(character.avatar);
        } catch (error) {
            console.error('Failed to clear character Skill reminders:', error);
        }
        accountStorage.removeItem(`AlertWI_${character.avatar}`);
        accountStorage.removeItem(`AlertRegex_${character.avatar}`);
        accountStorage.removeItem(`mediaWarningShown:${character.avatar}`);
        delete tag_map[character.avatar];
        select_rm_info('char_delete', character.name);

        if (deleteChats) {
            for (const chat of pastChats) {
                const name = chat.file_name.replace('.jsonl', '');
                await eventSource.emit(event_types.CHAT_DELETED, name);
            }
        }

        await eventSource.emit(event_types.CHARACTER_DELETED, { id: chid, character: character });
    }

    // Decide from the loaded list before a refresh can replace it, including after partial failure.
    const remainingCharacterFiles = new Set();
    for (const character of characters) {
        if (deletedAvatars.has(character.avatar)) continue;
        candidateLorebooks.delete(character.data?.extensions?.world);
        remainingCharacterFiles.add(getCharaFilename(null, { manualAvatarKey: character.avatar }));
    }
    for (const lore of world_info.charLore ?? []) {
        if (!remainingCharacterFiles.has(lore.name)) continue;
        for (const world of lore.extraBooks ?? []) candidateLorebooks.delete(world);
    }
    for (const world of selected_world_info) candidateLorebooks.delete(world);
    candidateLorebooks.delete(power_user.persona_description_lorebook);
    for (const persona of Object.values(power_user.persona_descriptions)) {
        candidateLorebooks.delete(persona.lorebook);
    }

    try {
        await removeCharacterFromUI();
    } catch (error) {
        console.error('Character deleted, but the UI refresh failed:', error);
        toastr.warning(t`Character deleted, but the character list could not be refreshed.`);
    }
    for (const world of candidateLorebooks) {
        try {
            if (await deleteWorldInfo(world, { saveLinkedCharacter: false })) {
                toastr.success(t`Also deleted lorebook "${world}"`);
            }
        } catch (error) {
            console.error('Character deleted, but its lorebook cleanup could not be completed:', error);
            toastr.warning(error?.message, t`Character deleted; lorebook cleanup failed`);
        }
    }

    return deletedAvatars.size > 0;
}

async function removeCharacterFromUI() {
    preserveNeutralChat();
    await clearChat();
    setCharacterPopupOpen(false);
    resetChatState();
    setSelectedCharacterName('');
    restoreNeutralChat();
    await getCharacters();
    await printMessages();
    saveSettingsDebounced();
    await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
}

export async function newAssistantChat({ temporary = false } = {}) {
    await clearChat();
    if (!temporary) {
        return openPermanentAssistantChat();
    }
    replaceChatContents([]);
    chat_metadata = {};
    setCharacterName(neutralCharacterName);
    sendSystemMessage(system_message_types.ASSISTANT_NOTE);
}

export async function doNavbarIconClick() {
    const panel = getTopLevelDrawerPanel($(this).get(0));
    if (!panel) return;
    const drawerWasOpenAlready = isTopLevelDrawerOpen(panel);

    if (!drawerWasOpenAlready) {
        const openDrawers = document.querySelectorAll('.drawer-content.openDrawer:not(.pinnedOpen)');
        for (const openPanel of openDrawers) setTopLevelDrawerOpen(openPanel, false);
        if (openDrawers.length && animation_duration) {
            await delay(animation_duration);
        }
        setTopLevelDrawerOpen(panel, true);

        if (panel.id === 'right-nav-panel') {
            favsToHotswap();
            $('#rm_print_characters_block').trigger('scroll');
        }

        // Set the height of "autoSetHeight" textareas within the drawer to their scroll height
        if (!CSS.supports('field-sizing', 'content')) {
            const textareas = panel.querySelectorAll('textarea.autoSetHeight');
            for (const textarea of textareas) {
                await resetScrollHeight($(textarea));
            }
        }
    } else {
        setTopLevelDrawerOpen(panel, false);
    }
}

export function setCharacterPopupOpen(open) {
    const panel = document.getElementById('character_popup');
    const hadFocus = panel.contains(document.activeElement);
    if (open) characterPopupOpener = document.activeElement;
    $(panel).toggleClass('open', open).css('display', open ? 'flex' : 'none');
    $('#advanced_div').attr('aria-expanded', String(open));
    if (open) document.getElementById('character_popup_text').focus();
    else if (hadFocus) characterPopupOpener?.focus();
}

export {
    user_avatar,
    setUserAvatar,
    getUserAvatars,
    getUserAvatar,
    nai_settings,
    isOdd,
    countOccurrences,
    renderTemplate,
    promptItemize,
    itemizedPrompts,
    saveItemizedPrompts,
    loadItemizedPrompts,
    itemizedParams,
    clearItemizedPrompts,
    replaceItemizedPromptText,
    deleteItemizedPrompts,
    findItemizedPromptSet,
    koboldai_settings,
    koboldai_setting_names,
    novelai_settings,
    novelai_setting_names,
    UNIQUE_APIS,
    CONNECT_API_MAP,
    system_messages,
    system_message_types,
    sendSystemMessage,
    getSystemMessageByType,
    event_types,
    eventSource,
    setCharacterSettingsOverrides as setScenarioOverride,
    appendMediaToMessage as appendImageToMessage,
    getMaxPromptTokens as getMaxContextSize,
    extension_prompt_types,
    extension_prompt_roles,
};

// ---------------------------------------------------------------------------
// 最小启动与聊天按钮绑定
// ---------------------------------------------------------------------------
jQuery(async () => {
    try {
        await invoke('wait_for_backend_ready');

        const csrf = await fetch('/csrf-token').then(r => r.json()).catch(() => null);
        if (csrf?.token) token = csrf.token;

        const tauriSettings = await getTauriTavernSettings();
        initializeListThumbnails(tauriSettings);
        reloadMarkdownProcessor();
        setWorldInfoSettings({}, { world_names: [] });

        const settingsResponse = await fetch('/api/settings/get', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({}),
            cache: 'no-cache',
        });
        if (settingsResponse.ok) {
            const snapshot = await settingsResponse.json();
            if (snapshot?.settings) {
                settings = JSON.parse(snapshot.settings);
                Object.assign(power_user, settings.power_user ?? {});
                Object.assign(oai_settings, settings.oai_settings ?? {});
                Object.assign(extension_settings, settings.extension_settings ?? {});
                name1 = settings.username || name1;
                main_api = settings.main_api === 'poe' ? 'openai' : (settings.main_api || 'openai');
                settingsReady = true;
                setupChatCompletionPromptManager(oai_settings);
            }
        }

        online_status = 'online';
        await getCharacters();
        document.getElementById('preloader')?.remove();

        $('#send_textarea').on('input', function () {
            $('#send_but').toggleClass('displayNone', !String($(this).val() || '').trim());
        });
        $('#send_but').on('click', () => { sendTextareaMessage().catch(error => console.error('[Flash] send failed', error)); });

        const first = characters.findIndex(character => character.chat);
        if (first >= 0) {
            await selectCharacterById(first, { chatFile: characters[first].chat });
        }
    } catch (error) {
        console.error('[Flash] startup failed', error);
    }
});
