import React, { useState, useEffect, useCallback } from 'react';
import { SavedTab, InternalTab, SavedGroup } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import HomeView from './components/HomeView';
import BrowserView from './BrowserView';
import SaveTabModal from './components/SaveTabModal';
import EditTabModal from './components/EditTabModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import AddSavedTabModal from './components/AddSavedTabModal';
import ManageGroupsModal from './components/ManageGroupsModal';
import ConfirmDeleteGroupModal from './components/ConfirmDeleteGroupModal';

type View = 'home' | 'browser';
type Theme = 'light' | 'dark';

const getDefaultTheme = (): Theme => {
  return 'dark';
};

const transformUrlForEmbedding = (inputUrl: string): string => {
  try {
    const urlObj = new URL(inputUrl);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    if ((hostname === 'www.youtube.com' || hostname === 'youtube.com') && pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    if (hostname === 'youtu.be' && pathname.length > 1) {
      const videoId = pathname.substring(1).split('/')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if ((hostname === 'www.youtube.com' || hostname === 'youtube.com') && pathname.startsWith('/shorts/')) {
        const videoId = pathname.substring('/shorts/'.length).split('/')[0];
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

  } catch (e) {
    // Not a valid URL, return original
  }
  return inputUrl;
};


const App: React.FC = () => {
  const [savedTabs, setSavedTabs] = useLocalStorage<SavedTab[]>('savedTabs', []);
  const [savedGroups, setSavedGroups] = useLocalStorage<SavedGroup[]>('savedGroups', []);
  const [internalTabs, setInternalTabs] = useState<InternalTab[]>([]);
  const [activeInternalTabId, setActiveInternalTabId] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useLocalStorage<Theme>('theme', getDefaultTheme);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Modal States
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tabToEdit, setTabToEdit] = useState<SavedTab | null>(null);
  const [tabToDeleteId, setTabToDeleteId] = useState<string | null>(null);
  const [isManageGroupsModalOpen, setIsManageGroupsModalOpen] = useState(false);
  const [groupToDeleteId, setGroupToDeleteId] = useState<string | null>(null);


  useEffect(() => {
    if (internalTabs.length === 0 && view !== 'home') {
      setView('home');
      setActiveInternalTabId(null);
    }
  }, [internalTabs.length, view]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  const activeTab = internalTabs.find(t => t.id === activeInternalTabId);

  const handleNewTab = useCallback(() => {
    const newTab: InternalTab = {
      id: crypto.randomUUID(),
      url: 'about:blank',
      isLoading: false,
      isBlocked: false,
    };
    setInternalTabs(prev => [...prev, newTab]);
    setActiveInternalTabId(newTab.id);
    setView('browser');
  }, []);
  
  const handleSwitchTab = useCallback((tabId: string) => {
    setActiveInternalTabId(tabId);
    setView('browser');
  }, []);
  
  const handleCloseTab = useCallback((tabId: string) => {
    setInternalTabs(prev => {
      const remainingTabs = prev.filter(t => t.id !== tabId);
      if (activeInternalTabId === tabId) {
        if (remainingTabs.length > 0) {
          const closingTabIndex = prev.findIndex(t => t.id === tabId);
          const newActiveIndex = Math.max(0, closingTabIndex - 1);
          setActiveInternalTabId(remainingTabs[newActiveIndex].id);
        } else {
          setActiveInternalTabId(null);
        }
      }
      return remainingTabs;
    });
  }, [activeInternalTabId]);

  const handleNavigate = useCallback((url: string, tabId: string) => {
    let formattedUrl = url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const finalUrl = transformUrlForEmbedding(formattedUrl);

    setInternalTabs(prev => prev.map(t =>
      t.id === tabId
        ? { ...t, url: finalUrl, isLoading: true, isBlocked: false }
        : t
    ));
  }, [setInternalTabs]);
  
  const handleOpenSavedTab = useCallback((savedTab: SavedTab) => {
    const finalUrl = transformUrlForEmbedding(savedTab.url);
    const existingTab = internalTabs.find(t => t.url === finalUrl || t.url === savedTab.url);
    
    if(existingTab) {
        setActiveInternalTabId(existingTab.id);
        setView('browser');
        return;
    }

    const newTab: InternalTab = {
      id: crypto.randomUUID(),
      url: finalUrl,
      isLoading: true,
      isBlocked: savedTab.embeddable === false,
    };
    setInternalTabs(prev => [...prev, newTab]);
    setActiveInternalTabId(newTab.id);
    setView('browser');
  }, [internalTabs]);

  // Tab CRUD
  const handleDeleteRequest = useCallback((tabId: string) => {
    setTabToDeleteId(tabId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (tabToDeleteId) {
      setSavedTabs(prev => prev.filter(t => t.id !== tabToDeleteId));
      setTabToDeleteId(null);
    }
  }, [setSavedTabs, tabToDeleteId]);

  const handleSaveCurrentTab = useCallback(() => {
    if (!activeTab || activeTab.url === 'about:blank' || activeTab.url.trim() === '') {
      return;
    }
    setIsSaveModalOpen(true);
  }, [activeTab]);

  const handleConfirmSaveTab = useCallback((data: { name: string, groupId?: string }) => {
    if (!activeTab) return;
    const newSavedTab: SavedTab = {
      id: crypto.randomUUID(),
      name: data.name,
      url: activeTab.url,
      embeddable: !activeTab.isBlocked,
      createdAt: new Date().toISOString(),
      groupId: data.groupId || undefined,
    };
    setSavedTabs(prev => [newSavedTab, ...prev]);
    setIsSaveModalOpen(false);
  }, [activeTab, setSavedTabs]);
  
  const handleConfirmAddSavedTab = useCallback((data: { name: string; url: string; groupId?: string }) => {
    let formattedUrl = data.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
  
    const newSavedTab: SavedTab = {
      id: crypto.randomUUID(),
      name: data.name,
      url: formattedUrl,
      embeddable: null,
      createdAt: new Date().toISOString(),
      groupId: data.groupId || undefined,
    };
    setSavedTabs(prev => [newSavedTab, ...prev]);
    setIsAddModalOpen(false);
  }, [setSavedTabs]);

  const handleOpenEditModal = useCallback((tab: SavedTab) => {
    setTabToEdit(tab);
  }, []);

  const handleUpdateSavedTab = useCallback((updatedTab: SavedTab) => {
    let formattedUrl = updatedTab.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    const finalTab = {...updatedTab, url: formattedUrl};

    setSavedTabs(prev => prev.map(t => t.id === finalTab.id ? finalTab : t));
    setTabToEdit(null);
  }, [setSavedTabs]);

  // Group CRUD
  const handleAddGroup = useCallback((name: string) => {
    const newGroup: SavedGroup = { id: crypto.randomUUID(), name };
    setSavedGroups(prev => [...prev, newGroup]);
  }, [setSavedGroups]);

  const handleUpdateGroup = useCallback((updatedGroup: SavedGroup) => {
    setSavedGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  }, [setSavedGroups]);

  const handleDeleteGroupRequest = useCallback((groupId: string) => {
    setGroupToDeleteId(groupId);
  }, []);

  const handleConfirmDeleteGroup = useCallback(() => {
    if (groupToDeleteId) {
      setSavedGroups(prev => prev.filter(g => g.id !== groupToDeleteId));
      setSavedTabs(prev => prev.map(tab => 
        tab.groupId === groupToDeleteId ? { ...tab, groupId: undefined } : tab
      ));
      setGroupToDeleteId(null);
    }
  }, [groupToDeleteId, setSavedGroups, setSavedTabs]);


  const handleIframeStatusChange = useCallback((status: { isLoading: boolean; isBlocked: boolean; }, tabId: string) => {
    if (!tabId) return;
    
    let tabUrl = '';
    setInternalTabs(prevTabs => prevTabs.map(t => {
      if (t.id === tabId) {
        tabUrl = t.url;
        return { ...t, isLoading: status.isLoading, isBlocked: status.isBlocked };
      }
      return t;
    }));

    if (status.isBlocked && tabUrl) {
        setSavedTabs(prev => prev.map(st => st.url === tabUrl ? {...st, embeddable: false} : st));
    }
  }, [setInternalTabs, setSavedTabs]);

  const handleReorderGroups = useCallback((draggedGroupId: string, targetGroupId: string) => {
    setSavedGroups(prevGroups => {
        const draggedIndex = prevGroups.findIndex(g => g.id === draggedGroupId);
        const targetIndex = prevGroups.findIndex(g => g.id === targetGroupId);
        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prevGroups;

        const newGroups = [...prevGroups];
        const [draggedItem] = newGroups.splice(draggedIndex, 1);
        newGroups.splice(targetIndex, 0, draggedItem);
        return newGroups;
    });
  }, [setSavedGroups]);

  const handleReorderTabs = useCallback((draggedTabId: string, targetTabId: string) => {
    setSavedTabs(prevTabs => {
        const draggedIndex = prevTabs.findIndex(t => t.id === draggedTabId);
        const targetIndex = prevTabs.findIndex(t => t.id === targetTabId);

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prevTabs;

        const newTabs = [...prevTabs];
        const [draggedItem] = newTabs.splice(draggedIndex, 1);
        
        draggedItem.groupId = prevTabs[targetIndex].groupId;

        const newTargetIndex = newTabs.findIndex(t => t.id === targetTabId);

        newTabs.splice(newTargetIndex, 0, draggedItem);
        
        return newTabs;
    });
  }, [setSavedTabs]);

  const handleMoveTabToGroup = useCallback((tabId: string, groupId: string | null) => {
    setSavedTabs(prevTabs => {
        return prevTabs.map(tab => 
            tab.id === tabId 
                ? { ...tab, groupId: groupId === null ? undefined : groupId } 
                : tab
        );
    });
  }, [setSavedTabs]);

  const handleGoToTabs = useCallback(() => {
    if (internalTabs.length > 0) {
      if (activeInternalTabId) {
        setView('browser');
      } else {
        const lastTabId = internalTabs[internalTabs.length - 1].id;
        setActiveInternalTabId(lastTabId);
        setView('browser');
      }
    }
  }, [internalTabs, activeInternalTabId]);

  const handleOpenGroup = useCallback((groupId: string | null) => {
    const tabsToOpen = savedTabs.filter(tab => {
        if (groupId === null) {
            return !tab.groupId;
        }
        return tab.groupId === groupId;
    });

    if (tabsToOpen.length === 0) {
        return;
    }

    const openUrls = new Set(internalTabs.map(t => t.url));

    const newInternalTabs: InternalTab[] = tabsToOpen
        .filter(savedTab => !openUrls.has(transformUrlForEmbedding(savedTab.url)))
        .map((savedTab) => {
            const finalUrl = transformUrlForEmbedding(savedTab.url);
            return {
                id: crypto.randomUUID(),
                url: finalUrl,
                isLoading: true,
                isBlocked: savedTab.embeddable === false,
            };
        });

    if (newInternalTabs.length === 0) {
        const firstUrl = transformUrlForEmbedding(tabsToOpen[0].url);
        const existingTab = internalTabs.find(t => t.url === firstUrl);
        if (existingTab) {
            setActiveInternalTabId(existingTab.id);
            setView('browser');
        }
        return;
    }

    setInternalTabs(prev => [...prev, ...newInternalTabs]);
    setActiveInternalTabId(newInternalTabs[0].id);
    setView('browser');
  }, [savedTabs, internalTabs]);

  const isSaveButtonDisabled = !activeTab || activeTab.url === 'about:blank' || activeTab.url.trim() === '';
  const tabToDelete = savedTabs.find(t => t.id === tabToDeleteId);
  const groupToDelete = savedGroups.find(g => g.id === groupToDeleteId);
  
  const filteredTabs = savedTabs.filter(tab => 
    searchQuery === '' ||
    tab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSavedTab = savedTabs.find(tab => tab.url === activeTab?.url);
  const activeTabSavedInfo = {
      isSaved: !!activeSavedTab,
      groupName: activeSavedTab?.groupId 
          ? savedGroups.find(g => g.id === activeSavedTab.groupId)?.name || null 
          : null
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {!isFullScreen && (
        <Header
            onNewTab={handleNewTab}
            onSaveTab={handleSaveCurrentTab}
            onGoHome={() => setView('home')}
            onGoToTabs={handleGoToTabs}
            internalTabs={internalTabs}
            activeInternalTabId={activeInternalTabId}
            onSwitchTab={handleSwitchTab}
            onCloseTab={handleCloseTab}
            isBrowserView={view === 'browser'}
            isSaveDisabled={isSaveButtonDisabled}
            activeTabSavedInfo={activeTabSavedInfo}
            theme={theme}
            onToggleTheme={handleToggleTheme}
        />
      )}
      <main className="flex-grow overflow-hidden">
        <div className={`h-full overflow-y-auto overflow-x-hidden ${view === 'browser' && activeTab ? 'hidden' : 'block'}`}>
          <HomeView
            savedTabs={filteredTabs}
            savedGroups={savedGroups}
            onOpen={handleOpenSavedTab}
            onDeleteTab={handleDeleteRequest}
            onEditTab={handleOpenEditModal}
            onNewTab={handleNewTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenManageGroupsModal={() => setIsManageGroupsModalOpen(true)}
            onOpenGroup={handleOpenGroup}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onReorderGroups={handleReorderGroups}
            onReorderTabs={handleReorderTabs}
            onMoveTabToGroup={handleMoveTabToGroup}
          />
        </div>
        
        <div className={`h-full ${view === 'browser' && activeTab ? 'block' : 'hidden'}`}>
          {internalTabs.map((tab) => (
            <div key={tab.id} className={`h-full ${tab.id === activeInternalTabId ? 'block' : 'hidden'}`}>
              <BrowserView
                tab={tab}
                onNavigate={(url) => handleNavigate(url, tab.id)}
                onStatusChange={(status) => handleIframeStatusChange(status, tab.id)}
                isFullScreen={isFullScreen}
                onToggleFullScreen={handleToggleFullScreen}
              />
            </div>
          ))}
        </div>
      </main>
      
      {/* Tab Modals */}
      <SaveTabModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleConfirmSaveTab}
        initialUrl={activeTab?.url}
        groups={savedGroups}
      />
      <AddSavedTabModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleConfirmAddSavedTab}
        groups={savedGroups}
      />
      <EditTabModal
        isOpen={!!tabToEdit}
        onClose={() => setTabToEdit(null)}
        onSave={handleUpdateSavedTab}
        tab={tabToEdit}
        groups={savedGroups}
      />
      <ConfirmDeleteModal
        isOpen={!!tabToDeleteId}
        onClose={() => setTabToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        tabName={tabToDelete?.name}
      />

      {/* Group Modals */}
      <ManageGroupsModal
        isOpen={isManageGroupsModalOpen}
        onClose={() => setIsManageGroupsModalOpen(false)}
        groups={savedGroups}
        savedTabs={savedTabs}
        onAddGroup={handleAddGroup}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleDeleteGroupRequest}
        onReorderGroups={handleReorderGroups}
      />
      <ConfirmDeleteGroupModal
        isOpen={!!groupToDeleteId}
        onClose={() => setGroupToDeleteId(null)}
        onConfirm={handleConfirmDeleteGroup}
        groupName={groupToDelete?.name}
      />
    </div>
  );
};

export default App;