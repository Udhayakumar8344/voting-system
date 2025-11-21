// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoteChain {

    struct Poll {
        string title;
        string[] candidates;
        uint256[] votes;
        uint256 createdAt;
        mapping(address => bool) usersVoted;
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) private polls;

    event PollCreated(
        uint256 indexed pollId,
        string title,
        string[] candidates
    );

    event Voted(
        uint256 indexed pollId,
        address voter,
        uint256 candidateIndex
    );

    // Create a poll
    function createPoll(string memory title, string[] memory _candidates) external {
        require(_candidates.length > 0, "No candidates");

        pollCount += 1;
        uint256 id = pollCount;

        Poll storage p = polls[id];
        p.title = title;
        p.createdAt = block.timestamp;

        for (uint256 i = 0; i < _candidates.length; i++) {
            p.candidates.push(_candidates[i]);
            p.votes.push(0);
        }

        emit PollCreated(id, title, _candidates);
    }

    // Vote for a candidate
    function vote(uint256 pollId, uint256 candidateIndex) external {
        require(pollId > 0 && pollId <= pollCount, "Invalid poll");
        Poll storage p = polls[pollId];

        require(!p.usersVoted[msg.sender], "Already voted");
        require(candidateIndex < p.candidates.length, "Invalid candidate");

        p.votes[candidateIndex] += 1;
        p.usersVoted[msg.sender] = true;

        emit Voted(pollId, msg.sender, candidateIndex);
    }

    // Get results as array of vote counts
    function getResults(uint256 pollId) external view returns (uint256[] memory) {
        require(pollId > 0 && pollId <= pollCount, "Invalid poll");
        return polls[pollId].votes;
    }

    // Get candidate names
    function getCandidates(uint256 pollId) external view returns (string[] memory) {
        require(pollId > 0 && pollId <= pollCount, "Invalid poll");
        return polls[pollId].candidates;
    }

    // Check if a user has voted
    function hasUserVoted(uint256 pollId, address user) external view returns (bool) {
        require(pollId > 0 && pollId <= pollCount, "Invalid poll");
        return polls[pollId].usersVoted[user];
    }

    // Get poll title
    function getPollTitle(uint256 pollId) external view returns (string memory) {
        require(pollId > 0 && pollId <= pollCount, "Invalid poll");
        return polls[pollId].title;
    }

    // Get poll creation timestamp
    function getPollCreatedAt(uint256 pollId) external view returns (uint256) {
        require(pollId > 0 && pollId <= pollCount, "Invalid poll");
        return polls[pollId].createdAt;
    }
}
