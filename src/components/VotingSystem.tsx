import React, { useState, useEffect } from 'react';
import { Vote, Plus, BarChart3, AlertCircle, Users, Calendar, TrendingUp, X, Check, Clock } from 'lucide-react';
import { getVoteChainContract } from '../utils/web3';
import { Poll } from '../types/contracts';
import { useWallet } from '../hooks/useWallet';

export const VotingSystem: React.FC = () => {
  const { wallet } = useWallet();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    candidates: ['', '']
  });
  const [selectedPoll, setSelectedPoll] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    userVotes: 0
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const loadPolls = async () => {
    if (!wallet.isConnected) return;
    
    try {
      clearMessages();
      const contract = await getVoteChainContract();
      const pollCount = await contract.pollCount();
      const pollsData: Poll[] = [];
      let totalVotes = 0;
      let userVotes = 0;

      for (let i = 0; i < Number(pollCount); i++) {
        try {
          const title = await contract.getPollTitle(i);
          const candidates = await contract.getCandidates(i);
          const results = await contract.getResults(i);
          const hasVoted = await contract.hasUserVoted(i, wallet.address);
          const createdAt = await contract.getPollCreatedAt(i);

          const votes = results.map((vote: any) => Number(vote));
          const pollTotalVotes = votes.reduce((sum, count) => sum + count, 0);
          totalVotes += pollTotalVotes;
          
          if (hasVoted) userVotes++;

          pollsData.push({
            id: i,
            title,
            candidates,
            votes,
            hasVoted,
            createdAt: Number(createdAt)
          });
        } catch (pollError) {
          console.error(`Error loading poll ${i}:`, pollError);
        }
      }

      setPolls(pollsData);
      setStats({
        totalPolls: pollsData.length,
        activePolls: pollsData.length, // All polls are considered active
        totalVotes,
        userVotes
      });
    } catch (error: any) {
      console.error('Failed to load polls:', error);
      setError('Failed to load polls. Make sure the contract is deployed and you\'re on the correct network.');
    }
  };

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) return;

    const validCandidates = createForm.candidates.filter(c => c.trim() !== '');
    if (validCandidates.length < 2) {
      setError('At least 2 candidates are required');
      return;
    }

    if (createForm.title.trim().length < 3) {
      setError('Poll title must be at least 3 characters long');
      return;
    }

    setLoading(true);
    clearMessages();
    
    try {
      const contract = await getVoteChainContract();
      const tx = await contract.createPoll(createForm.title.trim(), validCandidates);
      
      setSuccess('Transaction submitted! Waiting for confirmation...');
      await tx.wait();
      
      setCreateForm({ title: '', candidates: ['', ''] });
      setSuccess('Poll created successfully!');
      await loadPolls();
    } catch (error: any) {
      console.error('Failed to create poll:', error);
      if (error.reason) {
        setError(`Failed to create poll: ${error.reason}`);
      } else if (error.message.includes('user rejected')) {
        setError('Transaction was rejected by user');
      } else {
        setError('Failed to create poll. Please try again.');
      }
    }
    setLoading(false);
  };

  const vote = async (pollId: number, candidateIndex: number) => {
    if (!wallet.isConnected) return;

    setLoading(true);
    clearMessages();
    
    try {
      const contract = await getVoteChainContract();
      const tx = await contract.vote(pollId, candidateIndex);
      
      setSuccess('Vote submitted! Waiting for confirmation...');
      await tx.wait();
      
      setSuccess('Vote cast successfully!');
      await loadPolls();
    } catch (error: any) {
      console.error('Failed to vote:', error);
      if (error.reason) {
        setError(`Failed to cast vote: ${error.reason}`);
      } else if (error.message.includes('user rejected')) {
        setError('Transaction was rejected by user');
      } else {
        setError('Failed to cast vote. Please try again.');
      }
    }
    setLoading(false);
  };

  const addCandidate = () => {
    if (createForm.candidates.length < 10) { // Limit to 10 candidates
      setCreateForm({
        ...createForm,
        candidates: [...createForm.candidates, '']
      });
    }
  };

  const updateCandidate = (index: number, value: string) => {
    const newCandidates = [...createForm.candidates];
    newCandidates[index] = value;
    setCreateForm({
      ...createForm,
      candidates: newCandidates
    });
  };

  const removeCandidate = (index: number) => {
    if (createForm.candidates.length > 2) {
      const newCandidates = createForm.candidates.filter((_, i) => i !== index);
      setCreateForm({
        ...createForm,
        candidates: newCandidates
      });
    }
  };

  const getPollWinner = (poll: Poll) => {
    if (poll.votes.length === 0) return null;
    
    const maxVotes = Math.max(...poll.votes);
    if (maxVotes === 0) return null;
    
    const winnerIndex = poll.votes.indexOf(maxVotes);
    const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0);
    
    return {
      candidate: poll.candidates[winnerIndex],
      votes: maxVotes,
      percentage: totalVotes > 0 ? ((maxVotes / totalVotes) * 100).toFixed(1) : '0'
    };
  };

  useEffect(() => {
    if (wallet.isConnected) {
      loadPolls();
    }
  }, [wallet.isConnected, wallet.address]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Vote className="mx-auto h-12 w-12 text-purple-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Decentralized Voting System</h2>
        <p className="text-gray-600">Create transparent polls and vote on blockchain with complete immutability</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <Check className="text-green-500 flex-shrink-0" size={20} />
          <span className="text-green-700">{success}</span>
          <button onClick={clearMessages} className="ml-auto text-green-500 hover:text-green-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Dashboard */}
      {wallet.isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Polls</p>
                <p className="text-3xl font-bold">{stats.totalPolls}</p>
              </div>
              <Vote className="h-12 w-12 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Active Polls</p>
                <p className="text-3xl font-bold">{stats.activePolls}</p>
              </div>
              <Clock className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Votes</p>
                <p className="text-3xl font-bold">{stats.totalVotes}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">My Votes</p>
                <p className="text-3xl font-bold">{stats.userVotes}</p>
              </div>
              <Users className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Poll */}
        {wallet.isConnected && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Plus className="text-purple-500" size={20} />
              Create New Poll
            </h3>
            <form onSubmit={createPoll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Title *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What's your favorite blockchain platform?"
                  required
                  minLength={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.title.length}/200 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidates * (minimum 2, maximum 10)
                </label>
                <div className="space-y-2">
                  {createForm.candidates.map((candidate, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={candidate}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={`Candidate ${index + 1}`}
                        required
                        maxLength={100}
                      />
                      {createForm.candidates.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCandidate(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Remove candidate"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {createForm.candidates.length < 10 && (
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="mt-2 flex items-center gap-2 text-purple-500 hover:text-purple-600 transition-colors"
                  >
                    <Plus size={16} />
                    Add Candidate ({createForm.candidates.length}/10)
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || createForm.candidates.filter(c => c.trim()).length < 2}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Vote size={16} />
                    Create Poll
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Poll Results */}
        {selectedPoll !== null && polls[selectedPoll] && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <BarChart3 size={20} />
              Poll Results
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg mb-2">{polls[selectedPoll].title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Created: {new Date(polls[selectedPoll].createdAt * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>Total Votes: {polls[selectedPoll].votes.reduce((a, b) => a + b, 0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {polls[selectedPoll].candidates.map((candidate, index) => {
                  const votes = polls[selectedPoll].votes[index];
                  const totalVotes = polls[selectedPoll].votes.reduce((a, b) => a + b, 0);
                  const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : '0';
                  const isWinner = votes > 0 && votes === Math.max(...polls[selectedPoll].votes);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-medium ${isWinner ? 'text-purple-700' : 'text-gray-700'}`}>
                          {candidate} {isWinner && totalVotes > 0 && '👑'}
                        </span>
                        <span className="text-gray-600">
                          {votes} votes ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isWinner ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-purple-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {polls[selectedPoll].votes.reduce((a, b) => a + b, 0) === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Vote className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No votes cast yet</p>
                </div>
              )}
              
              {/* Winner announcement */}
              {(() => {
                const winner = getPollWinner(polls[selectedPoll]);
                return winner && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 text-purple-700">
                      <TrendingUp size={16} />
                      <span className="font-medium">Current Leader</span>
                    </div>
                    <p className="text-purple-800 font-semibold">
                      {winner.candidate} ({winner.percentage}% - {winner.votes} votes)
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Polls List */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Vote className="text-purple-500" size={20} />
          All Polls ({polls.length})
        </h3>
        
        {polls.length === 0 ? (
          <div className="text-center py-12">
            <Vote className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No polls found</p>
            <p className="text-gray-400 text-sm">Create the first poll to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.map((poll) => {
              const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0);
              const winner = getPollWinner(poll);
              
              return (
                <div key={poll.id} className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 line-clamp-2 flex-1">{poll.title}</h4>
                    {poll.hasVoted && (
                      <div className="flex-shrink-0 ml-2">
                        <Check className="text-green-500" size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Created: {new Date(poll.createdAt * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{poll.candidates.length} candidates, {totalVotes} total votes</span>
                    </div>
                    {winner && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <TrendingUp size={14} />
                        <span>Leading: {winner.candidate} ({winner.percentage}%)</span>
                      </div>
                    )}
                  </div>
                  
                  {!poll.hasVoted && wallet.isConnected ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Cast your vote:</p>
                      <div className="space-y-1">
                        {poll.candidates.map((candidate, index) => (
                          <button
                            key={index}
                            onClick={() => vote(poll.id, index)}
                            disabled={loading}
                            className="w-full text-left px-3 py-2 bg-white border border-purple-300 rounded hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {candidate}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {poll.hasVoted && (
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <Check size={16} />
                          <span className="text-sm font-medium">You've voted in this poll</span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedPoll(poll.id)}
                        className="w-full bg-purple-500 text-white py-2 px-3 rounded hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={16} />
                        View Results
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};